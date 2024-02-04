from django.db import IntegrityError
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse,JsonResponse, HttpResponseServerError
from rest_framework import serializers
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import CartSerializer,ItemSerializer, RegisterSerializer, LoginSerializer, EditSerializer, MyItemsSerializer
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
from django.core.serializers import serialize
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
            return Response(f"User with provided informations already exist", status=400)
        if user is not None:
            return Response(f"new user is: {user.get_username()}")
        return Response("no new user")

class EditAccountView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EditSerializer

    def put(self, request):
        user = request.user
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        
        #serializer = UserSerializer(
                                    # {'password' : request.data['old_password'],
                                    # 'new_password' : request.data['new_password']}),

        if serializer.is_valid():
            print('serializer\n', serializer['password'], user.check_password( 'pass1'))
            # Check old password and update the password
            if user.check_password(request.data['password']):
                print('Here')
                user.set_password(request.data['new_password'])
                user.save()
                return Response({'msg': 'Password updated successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'msg': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(serializer.errors)
            return Response({'msg': 'Incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

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
        
        # for elem in concatenated_data:
        #     print(elem)
        #print(concatenated_data)

        return JsonResponse({'items': concatenated_data}, status = 200)


    def create(self, request):
  
        added_id = request.data["itemId"]
        price_added = request.data["price"]

        user = request.user
        print("User id : ",user.id)
        print('Item ID : ', added_id )
        print("Price added")
        
        #TO REMOVE ADDED ITEM PRICE
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
        }
        serializer = self.serializer_class(data= serializer_data)

        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            print("[DEBUG] ", "Serializer not valid")
            print("[DEUBG ERROR SERIALIZER IN CARTVIEW ADD] ", serializer.errors)
            return JsonResponse({'msg': "not valid"}, status = 400)
        

        #try:
            
        item = Item.objects.get(id=serializer.data["added_item"])
        #print("DEBUG")
        # print("[BUYER]", user, type(user))
        # print("[BUYER]", user.id, type(user.id))
        # print("[BUYER]", user.username, type(user.username))
        # print("[SELLER] ", item.seller.id, type(item.seller.id))
        # print("[SELLER] ", item.seller.username, type(item.seller.username))


        if item.is_sold == False :
            # TO DO : REMOVE ADDED ITEM PRICE
            if item.seller.id != user.id:
                cartitem = CartModel.objects.filter(added_item__id=serializer.data["added_item"]).first()
                if cartitem:
                    #Item already in cart 
                    return JsonResponse({'msg': "Item already in your cart"}, status = 400)
                else :
                    print("ADDED")
                    CartModel.objects.create(added_by = user,
                                        added_item = item)
                    return JsonResponse({'msg': "Item successfully added to cart "}, status = 200)
            else:
                print("Not ADDED")
                return JsonResponse({'msg': " Add failed : this item belongs to you"}, status = 400)
        else :
            print("Not ADDED")
            return JsonResponse({'msg': " Add failed : Item no longer available"}, status = 400)
            
        
        # except Exception as e:
        #     print("[DEBUG ERROR ADD]\n", e)
            #return JsonResponse({'msg': str("Unable to add item due to "+ str(e))}, status = 400)
        
    def remove(self, request):
        """ REMOVE ITEM FROM USER CART"""
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
    
    def get_image_data(self, obj):
        print('[DEBUG TRYING TO GET IMG]')
        if obj.get('img_url'):
            return obj['img_url'] 
        elif obj.get('img_upload'):
            #obj['img_upload'] looks like : /item_images/Capture_décran_tab_option.png
            print("split : ", obj['img_upload'].split('/')) 
            
            _, folder, img_name = obj['img_upload'].split('/')
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

    def get_items(self, request):
        print("HERE")
        try:
            items = Item.objects.filter(is_sold=False)

            
            serialized_items = self.serializer_class(items, many=True).data
            #print("[DEBUBG PURCHASED] : ", serialized_purchased_items)
            
            for item in serialized_items:
                item['image'] = self.get_image_data(item)
             
            return JsonResponse({'items': serialized_items})
        except Exception as e:
            print(f"Error in get_items: {e}")
            return HttpResponseServerError({'error': 'Server error occurred '+ str(e)})
    
    def search_item(self, request):  
        try:
            request_data = json.loads(request.body.decode('utf-8'))

            search_term = request_data.get('SearchTerm', '')
            print("[DEBUG]  \n",search_term,"\n")

            if search_term != '':
                items = Item.objects.filter(title__icontains=search_term)
            else:
                items = Item.objects.all()

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
        print('[DEBUG TRYING TO GET IMG]')
        if obj.get('img_url'):
            return obj['img_url'] 
        elif obj.get('img_upload'):
            #obj['img_upload'] looks like : /item_images/Capture_décran_tab_option.png
            print("split : ", obj['img_upload'].split('/')) 
            
            _, folder, img_name = obj['img_upload'].split('/')
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
            sold_item =  Item.objects.filter(seller=user, is_sold=True)
            avalaible_items = Item.objects.filter(seller=user, is_sold=False)

            
            serialized_sold_items = self.serializer_class(sold_item, many=True).data

            #print("\n[DEBUBG SOLD] : ", serialized_sold_items)

            serialized_on_sale_items = self.serializer_class(avalaible_items, many=True).data
            #print("\n[DEBUBG ONSALE] : ", serialized_on_sale_items)

            purchased_items = OrderItems.objects.filter(user=request.user)
            purchased_item_ids = purchased_items.values_list('item', flat=True)
            purchased_items_data = Item.objects.filter(id__in=purchased_item_ids)
            serialized_purchased_items = self.serializer_class(purchased_items_data, many=True).data
            #print("[DEBUBG PURCHASED] : ", serialized_purchased_items)
            
            for item in serialized_sold_items:
                item['image'] = self.get_image_data(item)
            
            for item in serialized_on_sale_items:
                item['image'] = self.get_image_data(item)

            for item in serialized_purchased_items:
                item['image'] = self.get_image_data(item)

            response_data = {
                "sold": serialized_sold_items,
                "onsale": serialized_on_sale_items,
                "purchased" : serialized_purchased_items
            }
            
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

            serializer_data = {
                'title': request.data['title'],
                'description': request.data['description'],
                'price' : float(request.data['price']), 
                'seller': user.id,
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
            print('[DEBUG UPDATE ITEM]\n')
            item_id = request.data['id']
            item = Item.objects.filter(id=item_id).first()

            if item.is_sold:
                return JsonResponse({'error': 'Item have been sold'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            print('\nRequest is :\n', request.data)
            serializer_data = {
                'title': request.data['title'],
                'description': request.data['description'],
                'price': float(request.data['price']),
                'seller': user.id,
            }

            if request.data['url'] != '':
                serializer_data['img_url'] = request.data['url']
                serializer_data['img_upload'] = None  # Remove img_upload field if present
            else:
                print("[img_upload] is", request.data['file'])
                serializer_data['img_upload'] = request.data['file']
                serializer_data['img_url'] = None  # Remove img_url field if present

            serializer = ItemSerializer(instance=item, data=serializer_data, partial=True)
            if serializer.is_valid():
                print("\nSerializer is :\n", serializer)
                serializer.save()
                
                item_data = Item.objects.filter(id = item_id)
                serialized_item = self.serializer_class(item_data, many=True).data
                print('[DEBUG SERIALIZER]\n', serialized_item )
                for item in serialized_item:
                    item['image'] = self.get_image_data(item)
                print("[DEBUG]\n", serialized_item)
                return JsonResponse({'msg': 'Item updated successfully','updated_item' : serialized_item[0]}, status=status.HTTP_200_OK)
            else :
                print("[DEBUG UPDATE ITEM]: Serializer is not valid")
                print(serializer.errors)
                return JsonResponse({'msg': 'Serializer not valid'}, status=status.HTTP_200_OK)

            

        except Exception as e:
            print(str(e))
            return JsonResponse({'msg': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def remove(self, request):
        """ DELETE USER'S ITEM FROM DATABASE"""
        print('[DEBUG REMOVE ITEM FROM DATABASE]\n: ', request.data )
        serializer = ItemSerializer(request.data)
        if serializer.is_valid:
            user = request.user
            item_id = int(request.data["item"]['id'])
            print("User id : ",user.id)
            print('Item ID : ', item_id )
            
            
            try:
                item = Item.objects.get(id=item_id)
                item.delete()
                print("Item is:\n", item )
                print('Item will be deleted')
                return JsonResponse({'msg': "Item deleted successfully"}, status = 200)
            except Item.DoesNotExist:
                print("[DEBUG REMOVE ITEM FROM DATABASE]:", "Item not found in the database")
                return JsonResponse({'msg': 'Item not found in the database'}, status=status.HTTP_404_NOT_FOUND)
        else:
            print(serializer.errors)
            return JsonResponse({'msg': 'Serializer is not valid. An item must be provided'}, status=status.HTTP_404_NOT_FOUND)



      

class AboutMeView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(f"you are: {request.user.get_username()}")


class SessionAboutMeView(AboutMeView):
    authentication_classes = [authentication.SessionAuthentication]

#TO CHECK
class ValidateCartView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def pay_items(self, request):
        print('------------------------ [REQUEST ON VALIDATECARTVIEW] ---------------------------')
        user = request.user
        
        print("[USER IS] ", user)
        cart_items = CartModel.objects.filter(added_by = user)
        items_to_save = []
        # Initialize variables to keep track of successful and failed purchases
        successful_purchases = []
        items_to_purchase = request.data['items']
        print("\n\n[REQUEST IS] : ", request.data['items'], type(items_to_purchase), type(items_to_purchase[0]))
        

        for product in items_to_purchase:
            # {'id': 1, 
            #   'added_time': '2024-01-24T09:40:35.957828Z', 
            #   'added_by': 2, 
            #     'added_item': {'id': 1, 'title': 'Nike Swoosh', 'description': '...', 'price': '22.95', 
            #                    'date_added': '2024-01-20T17:52:31.051651Z', 
            #                    'is_sold': False, 
            #                    'img_upload': None, 
            #                    'img_url': '...', 
            #                    'seller': 2}
            product_id = int(product['added_item']['id'])
            #Price when request has been sent
            product_price = float(product['added_item']['price'])

            corresponding_item = Item.objects.filter(id = product_id).first()
            corresponding_cart_item = CartModel.objects.filter(added_by = user, added_item__id=product_id)
            serialized_item = ItemSerializer(corresponding_item).data
            print("'\n\n'[CORREPONDING ITEM]", corresponding_cart_item[0].added_by ,corresponding_cart_item[0].id )

            if corresponding_item.is_sold == True : 
                return JsonResponse({"msg": "Item no longer available", 
                                        "Item" : serialized_item, 
                                        "error_type" : "sold"}, status=status.HTTP_400_BAD_REQUEST)
            
            if float(corresponding_item.price) == float(product_price):
            
                purchase = OrderItems(
                    user=user,
                    item=corresponding_item,
                    quantity = 1
                )
                successful_purchases.append(purchase)

                
                items_to_save.append(corresponding_item)
                #item.save()
            else :
                #Price has changed
                #Transaction halted
            
                print("[DEBUG SERIALIZER ITEM]\n", serialized_item)

                return JsonResponse({"msg": "Price initially " + str(product_price) + " € has been updated by seller", 
                                        "Item" : serialized_item, 
                                        "error_type" : "price"}, status=status.HTTP_409_CONFLICT)

        for purchase in successful_purchases:
            purchase.save()

        #Item.objects.filter(id__in=[item.id for item in items_to_save]).update(is_sold=True)
        # Delete the user's cart
        user_cart = CartModel.objects.filter(added_by = user)
        #user_cart.delete()

        success_message = "Cart validated and items purchased successfully."

        return JsonResponse({"msg": success_message, 'error_type':'none'}, status=status.HTTP_200_OK)


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
                        img_url = item["imageUrl"]
                        Item.objects.create(title=title, description=description, price=price, img_url=img_url, seller=user)
                    

            return JsonResponse({'message': 'User created successfully'})
        except Exception as e:
            print("Error detected:\nFunction populate_db(request)", str(e))
            return HttpResponseServerError({'error': 'Server error occurred'})

        
    except Exception as e:
        print("Error occured : ",e)
        return HttpResponseServerError({'error': 'Server error occurred'})
    

