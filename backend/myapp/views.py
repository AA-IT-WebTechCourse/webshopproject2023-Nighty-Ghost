from django.db import IntegrityError
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse,JsonResponse, HttpResponseServerError
from rest_framework import serializers
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import CartSerializer,ItemSerializer, RegisterSerializer, LoginSerializer
from .models import CartModel, Item, OrderItems
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import authentication, permissions,status
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
import json, os
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.files.storage import default_storage
from urllib.parse import unquote
import random
import base64

# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def protected_view(request):
#     # protected view logic here

class LoginView(APIView):
    """
    Login a user
    """

    def post(self, request, format= None):
        print("DEBUG : ")
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response("not valid", status=400)
        user = authenticate(
            username=serializer.data["username"], password=serializer.data["password"]
        )
        if user is not None:
            login(request, user)
            print('DEBUG:', " User logged")
            return Response(f"is logged in: {user.get_username()}")
        return Response({'error': 'Invalid credentials. Try again or register.'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    """
    Register a new user
    """
    serializer_class = RegisterSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        
        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )
        if not serializer.is_valid():
            return Response("not valid", status=400)
        try:
            user = User.objects.create_user(
                username=serializer.data["username"],
                email=serializer.data["email"],
                password=serializer.data["password"],
            )
        except IntegrityError:
            return Response(f"same user name", status=400)
        if user is not None:
            return Response(f"new user is: {user.get_username()}")
        return Response("no new user")

class CartView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    queryset = CartModel.objects.all()
    serializer_class = CartSerializer
    
    def list(self, request):
        # Retrieve all cart items for the user
        user = request.user
        cart_instances = CartModel.objects.filter(added_by=user).order_by("added_time")

        # Extract item ids from the cart instances
        item_ids_list = [cart_instance.added_item.id for cart_instance in cart_instances]
        items_added_to_cart = Item.objects.filter(id__in=item_ids_list)
        cart_serializer = CartSerializer(cart_instances, many=True)
        item_serializer = ItemSerializer(items_added_to_cart, many=True)

        concatenated_data = []
        for cart_data, item_data in zip(cart_serializer.data, item_serializer.data):
            concatenated_data.append({**cart_data, 'added_item': item_data})
        
        for elem in concatenated_data:
            print(elem)
        #print(concatenated_data)

        return JsonResponse({'items': concatenated_data}, status = 200)


    def create(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'msg': 'Only authenticated users'}, status=status.HTTP_401_UNAUTHORIZED)
        
       
        added_id = request.data["itemId"]
        price_added = request.data["price"]

        user = request.user
        print("User id : ",user.id)
        print('Item ID : ', added_id )
        print("Price added")
        
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
            'added_item_price': price_added
        }
        serializer = self.serializer_class(data= serializer_data)

        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            print("[DEBUG] ", "Serializer not valid")
            print("[DEUBG ERROR SERIALIZER IN CARTVIEW ADD] ", serializer.errors)
            return JsonResponse({'msg': "not valid"}, status = 400)
        

        try:
            
            item = Item.objects.get(id=serializer.data["added_item"])
            #print("DEBUG")
            # print("[BUYER]", user, type(user))
            # print("[BUYER]", user.id, type(user.id))
            # print("[BUYER]", user.username, type(user.username))
            # print("[SELLER] ", item.seller.id, type(item.seller.id))
            # print("[SELLER] ", item.seller.username, type(item.seller.username))
            if item.seller.id != user.id:
                print("ADDED")
                CartModel.objects.create(added_by = user,
                                    added_item = item,
                                    added_item_price = price_added )
                return JsonResponse({'msg': "Item added to cart successfully"}, status = 200)
            else:
                print("Not ADDED")
                return JsonResponse({'msg': " Add failed : The item belongs to you"}, status = 400)
            
        
        except Exception as e:
            print("[DEBUG ERROR ADD]\n", e)
            return JsonResponse({'msg': str("Unable to add item due to "+ str(e))}, status = 200)
        
    def remove(self, request):
        added_id = request.data["itemId"]
        user = request.user
        print("User id : ",user.id)
        print('Item ID : ', added_id )
        
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
        }
        serializer = self.serializer_class(data= serializer_data)

        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            print("[DEBUG] ", "Serializer not valid")
            return JsonResponse({'msg': "not valid"}, status = 400)
        item = Item.objects.get(id=serializer.data["added_item"])
        cart_item = CartModel.objects.filter(added_by = user, added_item = item).first()
        print("[DEBUG delete Item] : ", cart_item)
        if cart_item:
            cart_item.delete()
            return JsonResponse({'msg': "Item deleted successfully"}, status = 200)
        else :
           return JsonResponse({'msg': "Item has not been found"}, status = 400) 
        
class ItemViewPublic(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_items(self, request):
        try:
            items = Item.objects.all().values()  
            return JsonResponse({'items': list(items)})
        except Exception as e:
            print(f"Error in get_items: {e}")
            return HttpResponseServerError({'error': 'Server error occurred '+ str(e)})
    
    def search_item(self, request):  
        try:
            request_data = json.loads(request.body.decode('utf-8'))

            search_term = request_data.get('SearchTerm', '')
            print("[DEBUG]  \n",search_term,"\n")

            items = Item.objects.filter(title__icontains=search_term)
            serialized_items = ItemSerializer(items, many=True).data

            return JsonResponse({'items': serialized_items})
        
        except Exception as e:
            print("Error detected:\nFunction search_item(request)", e)
            return HttpResponseServerError({'error': 'Server error occurred'})

class ItemView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    img_upload = serializers.ImageField(required=False)

    def get_image_data(self, obj):
        if obj.get('img_url'):
            return obj['img_url'] 
        elif obj.get('img_upload'):
            #obj['img_upload'] looks like : /item_images/Capture_décran_tab_option.png
            print("spliT : ", obj['img_upload'].split('/')) 

            print("MEDIA FOLDER : ", settings.MEDIA_ROOT)
            _, folder, img_name = obj['img_upload'].split('/')
            #img_path = os.path.join(settings.MEDIA_ROOT, folder, img_name)
            img_path = os.path.join(settings.BASE_DIR, folder, unquote(img_name))
            with open(img_path, 'rb') as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                print(obj['img_upload'].split("."))
                file_extension = obj['img_upload'].split(".")[1]
                content_type = f'image/{file_extension.lower()}'
                print("CONTENT TYPE IS ",content_type)
                return f'data:{content_type};base64,{encoded_image}'
        else:
            return None


    def list(self, request):
        user = request.user
        try:
            my_items = Item.objects.filter(seller=user)
            my_sold_items = my_items.filter(is_sold=True)
            my_not_sold_items = my_items.filter(is_sold=False)
            
            serialized_sold_items = self.serializer_class(my_sold_items, many=True).data
            
            serialized_not_sold_items = self.serializer_class(my_not_sold_items, many=True).data
            
            for item in serialized_sold_items:
                item['image'] = self.get_image_data(item)

            for item in serialized_not_sold_items:
                item['image'] = self.get_image_data(item)


            response_data = {
                "sold": serialized_sold_items,
                "not_sold": serialized_not_sold_items
            }
            print("END LIST ITEMS")
            return JsonResponse({'items': response_data}, status=200)
        
        except Exception as e:
            print(f"Error in my_items: {e}")
            return HttpResponseServerError({'error': 'Server error occurred '+ str(e)})
    


    
    def create(self, request):
        
        try :
            print("\nrequestion data: ",request.data )
            user = request.user
            print("[DEBUG CREATE NEW ITEM]\nUser id : ",user.id)
            print(request, "\nrequestion data: ", request.data)
            print("Ttile : ", request.data['title'])
            print("description : ", request.data['description'])
            print("price : ", request.data['price'])
            print("file : ", request.data['file'], type(request.data['file']))
            print("Quantity : ", request.data['quantity'], type(request.data['quantity']))

            serializer_data = {
                'title': request.data['title'],
                'description': request.data['description'],
                'price' : float(request.data['price']), 
                'seller': user.id,
                'item_quantity': int(request.data['quantity']),  
            }
            if request.data['url'] != '' :
                serializer_data['img_url'] = request.data['url']
            else :  
            
                serializer_data['img_upload'] = request.data['file']

            serializer = ItemSerializer(data=serializer_data)
            print(serializer)
            print("Is serialize valid ? ",serializer.is_valid() )
            if serializer.is_valid():
                serializer.save()
                print("Valid")
                return Response({'message': 'Item added successfully'}, status=status.HTTP_201_CREATED)
            else:
                print(serializer.errors)
                return Response({'error': 'Invalid serializer data'}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e :
            print("[DEBUG ItemView - Create function] msg : ", str(e))
            return JsonResponse({'msg': "Wrong input data"}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request):
        try:
            item_id = request.data['id']
            item = Item.objects.filter(id=item_id).first()

            if not item:
                return JsonResponse({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

            user = request.user
            serializer_data = {
                'title': request.data['title'],
                'description': request.data['description'],
                'price': float(request.data['price']),
                'seller': user.id,
                'item_quantity': int(request.data['quantity']),
            }

            if request.data['url'] != '':
                serializer_data['img_url'] = request.data['url']
                serializer_data.pop('img_upload', None)  # Remove img_upload field if present
            else:
                serializer_data['img_upload'] = request.data['file']
                serializer_data.pop('img_url', None)  # Remove img_url field if present

            serializer = ItemSerializer(instance=item, data=serializer_data, partial=True)
            if serializer.is_valid():
                serializer.save()

            return JsonResponse({'message': 'Item updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({'msg': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def remove(self, request):
        added_id = request.data["itemId"]
        user = request.user
        print("User id : ",user.id)
        print('Item ID : ', added_id )
        
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
        }
        serializer = self.serializer_class(data= serializer_data)

        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            print("[DEBUG] ", "Serializer not valid")
            return JsonResponse({'msg': "not valid"}, status = 400)
        item = Item.objects.get(id=serializer.data["added_item"])
        cart_item = CartModel.objects.filter(added_by = user, added_item = item).first()
        print("[DEBUG delete Item] : ", cart_item)
        if cart_item:
            cart_item.delete()
            return JsonResponse({'msg': "Item deleted successfully"}, status = 200)
        else :
           return JsonResponse({'msg': "Item has not been found"}, status = 400) 
      

class AboutMeView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(f"you are: {request.user.get_username()}")


class SessionAboutMeView(AboutMeView):
    authentication_classes = [authentication.SessionAuthentication]

#TO CHECK
class ValidateCartView(APIView):
    def post(self, request):
        user = request.user
        cart_items = CartModel.objects.filter(user=user)
        items_to_save = []
        # Initialize variables to keep track of successful and failed purchases
        successful_purchases = []

        for cart_item in cart_items:
            item = cart_item.added_item

            # Check if the item is still in stock
            if item.quantity >= cart_item.quantity:
                if item.price == cart_item.added_item_price:
                
                    purchase = OrderItems(
                        user=user,
                        item=item,
                        quantity=cart_item.quantity
                    )
                    successful_purchases.append(purchase)

                    # Update the item's quantity (subtract the purchased quantity)
                    item.quantity -= cart_item.quantity
                    items_to_save.append(item)
                    #item.save()
                else :
                    #Price has changed
                    #Transaction halted
                    return JsonResponse({"msg": "Price has changed", 
                                         "Item" : item, 
                                         "error_type" : "price"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                #Quantity insufficient
                #Transaction halted
                return JsonResponse({"msg": "Not enough stock, adjust the quantity to the available stock", 
                                     "Item" : item, 
                                     "error_type" : "quantity"}, status=status.HTTP_400_BAD_REQUEST)
                
        #Update Item Quatity and status
        Item.objects.bulk_update(items_to_save, ['quantity'])
        Item.objects.filter(id__in=[item.id for item in items_to_save]).update(is_sold=True)
        for purchase in successful_purchases:
            purchase.create()
            
        # Delete the user's cart
        cart_items.delete()

        success_message = "Cart validated and items purchased successfully."

        return JsonResponse({"message": success_message}, status=status.HTTP_200_OK)


@csrf_exempt
def populate_db(request):
    #Erasing all User and Item in the database
    User.objects.all().delete()
    Item.objects.all().delete()

    print("[DEBUG : populate_db(request)]")

    
    try :
        current_directory = os.getcwd()
        print("Current Working Directory:", current_directory)
        # JSON file path

        json_file_path = os.path.join(settings.BASE_DIR, 'myapp','static', 'db_automation_file', 'dataset_products.json')

        with open(json_file_path, 'r') as file:
            items_list = json.load(file)
        print("[DEBUG ]\n ",items_list)
            #Creating 6 users

        try : 
            for i in range(1, 7):
                username = f'testuser{i}'
                email = f'testuser{i}@shop.aa'
                password = f'pass{i}'
                user = User.objects.create_user(username=username, email=email, password=password)

                # For 3 users, create 10 items each
                if i <= 3:
                    
                    for j in range((i-1)*10, i*10):
                        item = items_list[j]
                        title = item["productName"] #f'Item{j} by {username}'
                        description =  item["description"] #f'Description for Item{j} by {username}'
                        price = float(item["listPrice"])
                        category = item["category"]
                        img_url = item["imageUrl"]
                        Item.objects.create(title=title, description=description, price=price, img_url=img_url, seller=user, item_quantity = random.randint(1,5))
                        #Item.objects.create(title=title, description=description, category=category,price=price, img_url=img_url, seller=user, auto_add = True)
                    

            return JsonResponse({'message': 'User created successfully'})
        except Exception as e:
            print("Error detected:\nFunction populate_db(request)", str(e))
            return HttpResponseServerError({'error': 'Server error occurred'})

        
    except Exception as e:
        print("Error occured : ",e)
        return HttpResponseServerError({'error': 'Server error occurred'})
    

