from django.db import IntegrityError
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse,JsonResponse, HttpResponseServerError
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
        
        print(serializer.data["added_by"],serializer.data["added_item"])
        
        try:
            
            item = Item.objects.get(id=serializer.data["added_item"])
            print(item)
            
            CartModel.objects.create(added_by = user,
                                    added_item = item)
            return JsonResponse({'msg': "Unable to add item"}, status = 200)
        
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
        


class ItemView(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class AboutMeView(APIView):
    authentication_classes = [authentication.SessionAuthentication, JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(f"you are: {request.user.get_username()}")


class SessionAboutMeView(AboutMeView):
    authentication_classes = [authentication.SessionAuthentication]



#TO CHECK
class ValidateCartView(APIView):
    def post(self, request, *args, **kwargs):
        user = self.request.user
        cart_items = CartModel.objects.filter(user=user)

        # Initialize variables to keep track of successful and failed purchases
        successful_purchases = []
        failed_purchases = []

        for cart_item in cart_items:
            item = cart_item.item

            # Check if the item is still in stock
            if item.quantity >= cart_item.quantity:
                # Create a Purchase record
                purchase = OrderItems(
                    user=user,
                    item=item,
                    quantity=cart_item.quantity
                )
                successful_purchases.append(purchase)

                # Update the item's quantity (subtract the purchased quantity)
                item.quantity -= cart_item.quantity
                item.save()
            else:
                # Not enough stock, adjust the quantity to the available stock
                cart_item.quantity = item.quantity
                failed_purchases.append(cart_item)

        # Clear the user's cart
        cart_items.delete()

        success_message = "Cart validated and items purchased successfully."
        if failed_purchases:
            success_message += " Some items could not be purchased due to insufficient stock."

        return JsonResponse({"message": success_message}, status=status.HTTP_200_OK)

@csrf_exempt
def search_item(request):
    
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
                        Item.objects.create(title=title, description=description, price=price, img_url=img_url, seller=user, auto_add = True)
                        #Item.objects.create(title=title, description=description, category=category,price=price, img_url=img_url, seller=user, auto_add = True)
                    

            return JsonResponse({'message': 'User created successfully'})
        except Exception as e:
            print("Error detected:\nFunction populate_db(request)", str(e))
            return HttpResponseServerError({'error': 'Server error occurred'})

        
    except Exception as e:
        print("Error occured : ",e)
        return HttpResponseServerError({'error': 'Server error occurred'})
    

    
@csrf_exempt
def get_items(request):
    try : 
        items = Item.objects.all().values()  # Convert QuerySet to a list of dictionaries
        print(len(items))
        return JsonResponse({'items': list(items)})
    except Exception as e:
        print("Error detected:\nFunction get_items(request)", e)
        return HttpResponseServerError({'error': 'Server error occurred'})
