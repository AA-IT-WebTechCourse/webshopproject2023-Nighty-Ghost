from django.db import IntegrityError
from django.conf import settings
from django.shortcuts import render
from django.db.models import Q
from django.http import HttpResponse,JsonResponse, HttpResponseServerError
from rest_framework import serializers
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import CartSerializer,ItemSerializer, RegisterSerializer, SearchItemSerializer, EditSerializer, LoginSerializer,ValidateCartDataSerializer ,ValidateCartSerializer
from .models import CartModel, Item, OrderItems
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import authentication, permissions,status
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
import json, os
from django.contrib.auth import authenticate
from datetime import datetime, timedelta
from django.core.files.storage import default_storage
from urllib.parse import unquote
from django.core.serializers import serialize
import base64

# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def protected_view(request):
#     # protected view logic here
def get_image_data(obj):
    """
    Function : Returns encoded data of img of an item
    """
    if obj.get('img_url'):
        return obj['img_url'] 
    elif obj.get('img_upload'):
        #obj['img_upload'] looks like : /item_images/Capture_décran_tab_option.png
        #print("split : ", obj['img_upload'].split('/')) 
        
        _, folder, img_name = obj['img_upload'].split('/')
        img_path = os.path.join(settings.BASE_DIR, folder, unquote(img_name))
        with open(img_path, 'rb') as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
            #print(obj['img_upload'].split("."))
            file_extension = obj['img_upload'].split(".")[1]
            content_type = f'image/{file_extension.lower()}'
            #print("CONTENT TYPE IS ",content_type)
            return f'data:{content_type};base64,{encoded_image}'
    else:
        return None

class RegisterView(APIView):
    """
    Register a new user
    """
    serializer_class = RegisterSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        
        #print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )
        if not serializer.is_valid():
            #print("Error: ", serializer.errors)
            error_msg = "Serializer is not valid :" + str(serializer.errors)
            return Response({"msg" : error_msg}, status=400)
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
    


class LoginView(APIView):
    """
    Login a user
    """
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Extract username and password from serializer data
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Authenticate user
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(f"{user.get_username()} is logged in.")
        else:
            return Response({'error': 'Invalid credentials. Try again or register.'}, status=status.HTTP_401_UNAUTHORIZED)


class EditAccountView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EditSerializer

    def put(self, request):
        """
        Function: Updates user account password
        request.data = {'password' : str
                        'new_password' : str }
        """
        user = request.user
        #print(user)
        #print(request.data)
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            #print('serializer\n', serializer['password'], user.check_password( 'pass1'))
            # Check old password and update the password
            if user.check_password(request.data['password']):
                user.set_password(request.data['new_password'])
                user.save()
                return Response({'msg': 'Password updated successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'msg': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            #print(serializer.errors)
            return Response({'msg': 'Incorrect inputs. Password and New Password must be provided'}, status=status.HTTP_400_BAD_REQUEST)

class CartView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    queryset = CartModel.objects.all()
    serializer_class = CartSerializer
    

    
    def list(self, request):
        """
        Function : Retrieve all cart items for the user
        """
        
        user = request.user
        cart_instances = CartModel.objects.filter(added_by=user).order_by("added_time")

        # Extract item ids from the cart 
        item_ids_list = [cart_instance.added_item.id for cart_instance in cart_instances]
        items_added_to_cart = Item.objects.filter(id__in=item_ids_list)

        cart_serializer = CartSerializer(cart_instances, many=True)
        item_serializer = ItemSerializer(items_added_to_cart, many=True).data

        for item in item_serializer:
            item['image'] = get_image_data(item)
           
        # concatenated_data = []
        # for cart_data, item_data in zip(cart_serializer.data, item_serializer):
        #     concatenated_data.append({**cart_data, 'added_item': item_data})
            
        return JsonResponse({'items': item_serializer}, status = 200)


    def create(self, request):
        """
        Function : Adds an item to user's cart
        Request.data : {'itemId' : str}
        """
  
        added_id = request.data["itemId"]
        user = request.user
        #print("User id : ",user.id)
        #print('Item ID : ', added_id )

        
        #TO REMOVE ADDED ITEM PRICE
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
        }
        serializer = self.serializer_class(data= serializer_data)

        #print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            #print("[DEBUG] ", "Serializer not valid")
            #print("[DEUBG ERROR SERIALIZER IN CARTVIEW ADD] ", serializer.errors)
            return JsonResponse({'msg': "not valid"}, status = 400)
        
        item = Item.objects.get(id=serializer.data["added_item"])

        if item.is_sold == False :
            
            if item.seller.id != user.id:
                cartitem = CartModel.objects.filter(added_item__id=serializer.data["added_item"]).first()
                if cartitem:
                    #Item already in cart 
                    return JsonResponse({'msg': "Item already in your cart"}, status = 400)
                else :
                    #print("ITEM ADDED TO CART")
                    CartModel.objects.create(added_by = user,
                                        added_item = item)
                    return JsonResponse({'msg': "Item successfully added to cart "}, status = 200)
            else:
                #print("ITEM NOT ADDED TO CART")
                return JsonResponse({'msg': " Add failed : this item belongs to you"}, status = 400)
        else :
            #print("ITEM NOT ADDED TO CART")
            return JsonResponse({'msg': " Add failed : Item no longer available"}, status = 400)
            
        
    def remove(self, request):
        """ 
        Function : Remove Item from user cart
        request.data : {'itemID': str }
        """
        added_id = request.data["itemId"]
        user = request.user
        #print("User id : ",user.id)
        #print('Item ID : ', added_id )
        
        serializer_data = {
            'added_by': user.id,
            'added_item': added_id,  
        }
        serializer = self.serializer_class(data= serializer_data)

        #print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )

        if not serializer.is_valid():
            #print("[DEBUG] ", "Serializer not valid")
            return JsonResponse({'msg': "not valid"}, status = 400)
        item = Item.objects.get(id=serializer.data["added_item"])
        cart_item = CartModel.objects.filter(added_by = user, added_item = item).first()
        #print("[DEBUG delete Item] : ", cart_item)
        if cart_item:
            cart_item.delete()
            return JsonResponse({'msg': "Item deleted successfully"}, status = 200)
        else :
           return JsonResponse({'msg': "Item has not been found in your cart"}, status = 400) 
        
class ItemViewPublic(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_items(self, request):
        """
        Function: Retrieve all available items in the database
        """
        try:
            items = Item.objects.filter(is_sold=False)

            serialized_items = self.serializer_class(items, many=True).data    
            for item in serialized_items:
                item['image'] = get_image_data(item)
             
            return JsonResponse({'items': serialized_items}, status = 200)
        except Exception as e:
            #print(f"Error in get_items: {e}")
            return JsonResponse({'msg': 'Server error occurred '+ str(e)}, status = 400)
    
  
class SearchItemView(APIView):
    serializer_class = SearchItemSerializer
    def post(self, request):  
        """
        Function: Retrieve searched items by title
        request.data: {'SearchTerm' : str}

        """
        try:
            #print("Request DATA : ", request.data)

            search_term = request.data['search']
   

            #print("[DEBUG]  \n",search_term,"\n")


            if search_term != '':
                #List of words contained in search
                search_terms = search_term.split(' ')
                query = Q()
                for term in search_terms:
                    #Search by title
                    query |= Q(title__icontains=term)

                items = Item.objects.filter(query)
                #print("Search terms\n")
                #print("- Lenght : ", len(items))
                #print('- Item : ', items)
            else:
                items = Item.objects.all()

            serialized_items = ItemSerializer(items, many=True).data
            for item in serialized_items:
                item['image'] = get_image_data(item)
            return JsonResponse({'items': serialized_items})
                
        
        except Exception as e:
            #print("Error detected:\nFunction search_item(request)", e)
            return JsonResponse({'error': 'Server error occurred'}, status = 400)
    

class ItemView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    img_upload = serializers.ImageField(required=False)



    def list(self, request):
        """
        Function: Retrieve Inventory of an user
        
        """
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
                item['image'] = get_image_data(item)
            
            for item in serialized_on_sale_items:
                item['image'] = get_image_data(item)

            for item in serialized_purchased_items:
                item['image'] = get_image_data(item)

            response_data = {
                "sold": serialized_sold_items,
                "onsale": serialized_on_sale_items,
                "purchased" : serialized_purchased_items
            }
            
            return JsonResponse({'items': response_data}, status=200)
        
        except Exception as e:
            #print(f"Error retrieving content of inventory: {e}")
            return HttpResponseServerError({'msg': f"Error retrieving content of inventory: {e}"})
    
    
    def create(self, request):
        """
        Function: Create a new item 
        request.data: { 'title': str,
                        'description': str,
                        'price' : str,
                        'url' : str,
                        'file': FileField}
        Either url or file not both at the same time
        """
        
        try :
            user = request.user
            #print("[DEBUG CREATE NEW ITEM]\nUser id : ",user.id)
            # #print(request, "\nrequestion data: ", request.data)
            # #print("Ttile : ", request.data['title'])
            # #print("description : ", request.data['description'])
            # #print("price : ", request.data['price'])
            # #print("file : ", request.data['file'], type(request.data['file']))

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
            #print(serializer)

            if serializer.is_valid():
                serializer.save()
                #print(serializer.validated_data)
                image_data = get_image_data(serializer.data)
                item = serializer.data
                item['image'] = image_data
                return Response({'message': 'Item added successfully', 'item': item}, status=status.HTTP_201_CREATED)
            else:
                #print("Serializer not Valid")
                #print(serializer.errors)
                error_msg = 'Invalid input data (required title, description and price): ' + str(serializer.errors) 
                return Response({'msg': error_msg}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e :
            #print("[DEBUG ItemView - Create function Eroor] : ", str(e))
            return JsonResponse({'msg': str("Error Occured" +str(e))}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request):
        """
        Function: Updates informations of an item
        request.data: { 'title': str,
                        'description': str,
                        'price' : str,
                        'url' : str,
                        'file': Fileobject}
        Either url or file not both at the same time
        """
        try:
            #print('[DEBUG UPDATE ITEM]\n')
            item_id = request.data['id']
            item = Item.objects.filter(id=item_id).first()

            if item.is_sold:
                return JsonResponse({'error': 'Item have been sold'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            #print('\nRequest is :\n', request.data)
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
                #print("[img_upload] is", request.data['file'])
                serializer_data['img_upload'] = request.data['file']
                serializer_data['img_url'] = None  # Remove img_url field if present

            serializer = ItemSerializer(instance=item, data=serializer_data, partial=True)
            if serializer.is_valid():
                #print("\nSerializer is :\n", serializer)
                serializer.save()
                
                item_data = Item.objects.filter(id = item_id)
                serialized_item = self.serializer_class(item_data, many=True).data
                #print('[DEBUG SERIALIZER]\n', serialized_item )
                for item in serialized_item:
                    item['image'] = get_image_data(item)
                #print("[DEBUG]\n", serialized_item)
                return JsonResponse({'msg': 'Item updated successfully','updated_item' : serialized_item[0]}, status=status.HTTP_200_OK)
            else :
                #print("[DEBUG UPDATE ITEM]: Serializer is not valid")
                #print(serializer.errors)
                return JsonResponse({'msg': 'Serializer not valid. Required title, description, price, url image or file image'}, status=status.HTTP_200_OK)
          
        except Exception as e:
            #print(str(e))
            return JsonResponse({'msg': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def remove(self, request):
        """ 
        Function: Removes an item from database
        Request.data: an ID item
        """
        
        #print('[DEBUG REMOVE ITEM FROM DATABASE]\n: ', request.data )
        
        user = request.user
        item_id = int(request.data["item_id"])
        #print("User id : ",user.id)
        #print('Item ID : ', item_id )
        
        try:
            item = Item.objects.filter(id = item_id, seller = user)
            item.delete()

            return JsonResponse({'msg': "Item deleted successfully"}, status = 200)
        
        except Exception as e:
            #print("[DEBUG REMOVE ITEM FROM DATABASE]:", "Item not found in the database")
            #print("Error : ", str(e))
            error_msg = "Item with id " + item_id + " belonging to you has not been found in database"
            return JsonResponse({'msg': error_msg}, status=status.HTTP_404_NOT_FOUND)

      

class AboutMeView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(f"you are: {request.user.get_username()}")


class SessionAboutMeView(AboutMeView):
    authentication_classes = [authentication.SessionAuthentication]


class ValidateCartView(viewsets.ModelViewSet):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ValidateCartSerializer

    def pay_items(self, request):
        """
        Function validate Cart
        request.data: a dict with key idAndPriceList which value is a list of dict of item_id + associated_price when validating cart

        Example :   {
                        'idAndPriceList': [{'id': 45, 'price': '22.95'}, 
                                            {'id': 46, 'price': '154.95'}, 
                                            {'id': 47, 'price': '64.95'}]
                    }
        """
        #print('------------------------ [REQUEST ON VALIDATECARTVIEW] ---------------------------')
        user = request.user
        

        #print('Request.data : \n\n', request.data)


        #print("[USER IS] ", user)
        items_to_save = []
        # Initialize variables to keep track of successful and failed purchases
        successful_purchases = []
        failed_purchases = []
        items_to_purchase = request.data['idAndPriceList']
        #print("ITEMS TO PURCHASE : \n", items_to_purchase, type(items_to_purchase))
        validate_serializer = ValidateCartDataSerializer(data=items_to_purchase, many=True)
        is_valid = validate_serializer.is_valid()
        #print("Is Valid:", is_valid)

        if not is_valid:
            #print("Validation Errors:", validate_serializer.errors)
            msg_error = "Invalid Input - Serializer is not valid : " + str(validate_serializer.errors)
            return JsonResponse({"msg": msg_error,
                                  "list_failed_purchases" : failed_purchases,
                                 'error_type':'BAD REQUEST'}, status=status.HTTP_400_BAD_REQUEST)
        
        #print("\n\n[REQUEST IS] : ", request.data)
        
        for product in items_to_purchase:

            product_id = int(product['id'])
            product_price = float(product['price'])

            corresponding_item = Item.objects.filter(id = product_id).first()
            corresponding_cart_item = CartModel.objects.filter(added_by = user, added_item__id=product_id)
            serialized_item = ItemSerializer(corresponding_item).data

            #print("'\n\n'[CORREPONDING ITEM]", corresponding_cart_item[0].added_by ,corresponding_cart_item[0].id )
            if corresponding_item:
                if corresponding_item.is_sold == True :
                    failed_purchases.append({"msg": "Item no longer available", 
                                            "Item" : serialized_item, 
                                            "error_type" : "sold"})
                    
                if float(corresponding_item.price) == float(product_price):
                    #Price has not changed
                    purchase = OrderItems(
                        user=user,
                        item=corresponding_item,
                        quantity = 1
                    )
                    successful_purchases.append(purchase)
                    items_to_save.append(corresponding_item)
                    
                else :
                    #Price has changed
                    #Transaction halted
                
                    #print("[DEBUG SERIALIZER ITEM]\n", serialized_item)
                    failed_purchases.append({"msg": "Price initially " + str(product_price) + " € has been updated by seller", 
                                            "Item" : serialized_item, 
                                            "error_type" : "price"})
            else:
                #ITEM DOES NOT EXIST IN USER'S CART
                #For API
                error_msg = 'Failed cart validation : Item with id ' + str(product_id) + ' does not exist in your cart'
                                #Especially when request sent from API
                failed_purchases.append({"msg": error_msg, 
                                        "Item" : serialized_item, 
                                        "error_type" : "does not exist in user's cart"})

        if len(failed_purchases) == 0:
            #Save successful when there no fail
            for purchase in successful_purchases:
                purchase.save()
                #print('\nA purchase is :\n-->', purchase)
            Item.objects.filter(id__in=[item.id for item in items_to_save]).update(is_sold=True)
            
            # Delete the user's cart
            user_cart = CartModel.objects.filter(added_by = user)
            user_cart.delete()

            success_message = "Cart validated and items purchased successfully."
            return JsonResponse({"msg": success_message, 
                                 'error_type':'none'}, status=status.HTTP_200_OK)
        else:
            return JsonResponse({"msg": "Cart transaction halted",
                                 "list_failed_purchases" : failed_purchases, 
                                 'error_type':'CONFLCT'}, status=status.HTTP_409_CONFLICT)
        
@csrf_exempt
def landing_page(request):
    flash_message = None 
    return render(request, 'landingPageTemplate.html', {'flash_message': flash_message})

@csrf_exempt
def populate_db(request):
    """
    Function: Populates database with users and items"""
    #Erasing  User and Item Table data in the database
    User.objects.all().delete()
    Item.objects.all().delete()

    #print("[DEBUG] : Populate DB")

    
    try :

        # JSON file path
        json_file_path = os.path.join(settings.BASE_DIR, 'myapp','static', 'db_automation_file', 'dataset_products.json')

        with open(json_file_path, 'r') as file:
            items_list = json.load(file)
        #print("[DEBUG ]\n ",items_list)
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
                        title = item["productName"] 
                        description =  item["description"] 
                        price = float(item["listPrice"])
                        img_url = item["imageUrl"]
                        Item.objects.create(title=title, description=description, price=price, img_url=img_url, seller=user)
            return JsonResponse({'message': 'Users and Items created successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            #print("Error detected:\nFunction populate_db(request)", str(e))
            return JsonResponse({'message': 'Server error occurred. Could not create users and items'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    except Exception as e:
        #print("Error occured : ",e)
        return JsonResponse({'message': 'Server error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

