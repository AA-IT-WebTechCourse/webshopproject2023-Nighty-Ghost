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

    queryset = CartModel.objects.all()
    serializer_class = CartSerializer
    
    def list(self, request):
        # Retrieve all cart items
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return  JsonResponse({"data": serializer.data}, status = 200) 

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )
        if not serializer.is_valid():
            print("[DEBUG] ", "Serializer not valid")
            return JsonResponse({'msg': "not valid"}, status = 400)
        print(serializer.data["added_by"],serializer.data["added_item"], serializer.data["added_time"] )
        return JsonResponse({'msg': "Item added to cart"}, status = 200)
    
    def remove(self, request):
        serializer = self.serializer_class(data=request.data)
        print("Serializer ",serializer, "\n Is valid: ", serializer.is_valid() )
        if not serializer.is_valid():
            print("[DEBUG] REMOVE CART FUNCTION", "Serializer not valid")
            return JsonResponse({'msg': "not valid"}, status = 400)       
        
        cart_item = CartModel.objects.get(pk=serializer.data["id"])
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

class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     def post(self, request):
          try:
               refresh_token = request.data["refresh_token"]
               token = RefreshToken(refresh_token)
               token.blacklist()
               return Response(status=status.HTTP_205_RESET_CONTENT)
          except Exception as e:
               return Response(status=status.HTTP_400_BAD_REQUEST)



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


def hello(request):
    return HttpResponse("Hello")


def great(request, name):
    return HttpResponse(f"Hello, {name}")


def nicergreat(request, name):
    return render(request, "mytemplate.html", {"aname": name})


def cards(request, count):
    alllist = ["red", "blue", "yellow", "green"]
    colorlist = alllist[:count]
    return render(request, "cardsTemplate.html", {"color_list": colorlist})

@csrf_exempt
def add_items_to_cart():
    return

@csrf_exempt
def populate_db(request):
    #Erasing all User and Item in the database
    User.objects.all().delete()
    Item.objects.all().delete()

    print("[DEBUG : populate_db(request)]")

    
    try :
        # item_list = [
        #       {
        #         "title": "Winter Coat",
        #         "description": "Warm and stylish winter coat with faux fur lining for extra comfort.",
        #         "price": 129.99,
        #     },
        #     {
        #         "title": "Running Shoes",
        #         "description": "High-performance running shoes with advanced cushioning and support.",
        #         "price": 89.99,
        #     },
        #     {
        #         "title": "Leather Jacket",
        #         "description": "Classic leather jacket with a stylish design and comfortable fit.",
        #         "price": 149.99,
        #     },
        #     {
        #         "title": "Business Suit",
        #         "description": "Tailored business suit for a sophisticated and professional look.",
        #         "price": 249.99,
        #     },
        #     {
        #         "title": "Winter Coat",
        #         "description": "Warm and durable winter coat with insulation for cold weather.",
        #         "price": 179.99,
        #     },
        #     {
        #         "title": "Sneakers",
        #         "description": "Casual sneakers with a trendy design, suitable for everyday wear.",
        #         "price": 59.99,
        #     },
            
        #     {
        #         "title": "Hiking Boots",
        #         "description": "Sturdy hiking boots with waterproof features for outdoor adventures.",
        #         "price": 129.99,
        #     },
        #     {
        #         "title": "Denim Jeans",
        #         "description": "Classic denim jeans with a comfortable fit, perfect for casual occasions.",
        #         "price": 69.99,
        #     },
        #     {
        #         "title": "Summer Dress",
        #         "description": "Lightweight and stylish summer dress for a fashionable look.",
        #         "price": 79.99,
        #     },
        #     {
        #         "title": "Formal Shirt",
        #         "description": "Elegant formal shirt made from high-quality fabric for special occasions.",
        #         "price": 49.99,
        #     },
        #     {
        #       "title": "Sports Bra",
        #       "description": "Supportive sports bra designed for comfort during workouts.",
        #       "price": 34.99,
        #   },
        #   {
        #       "title": "Track Pants",
        #       "description": "Breathable track pants suitable for running and other activities.",
        #       "price": 44.99,
        #   },
        #   {
        #       "title": "Wool Sweater",
        #       "description": "Cozy wool sweater for chilly days, with a classic knit pattern.",
        #       "price": 54.99,
        #   },
        #   {
        #       "title": "Graphic T-Shirt",
        #       "description": "Stylish graphic t-shirt featuring unique artwork and a modern fit.",
        #       "price": 24.99,
        #   },
        #   {
        #       "title": "Leather Boots",
        #       "description": "Fashionable leather boots with a trendy design, perfect for any season.",
        #       "price": 109.99,
        #   },
        #   {
        #       "title": "Summer Hat",
        #       "description": "Wide-brimmed summer hat for sun protection and a stylish look.",
        #       "price": 19.99,
        #   },
        #   {
        #       "title": "Puffer Jacket",
        #       "description": "Quilted puffer jacket with insulation for warmth in colder weather.",
        #       "price": 79.99,
        #   },
        #   {
        #       "title": "Yoga Leggings",
        #       "description": "Comfortable and flexible yoga leggings for your fitness routine.",
        #       "price": 29.99,
        #   },
        #   {
        #       "title": "Plaid Shirt",
        #       "description": "Classic plaid shirt made from soft cotton for a casual yet refined style.",
        #       "price": 39.99,
        #   },
        #   {
        #       "title": "Raincoat",
        #       "description": "Waterproof raincoat with a stylish design to keep you dry in the rain.",
        #       "price": 64.99,
        #   },
        #   {
        #     "title": "Running Shoes",
        #     "description": "High-performance running shoes with advanced cushioning technology.",
        #     "price": 89.99,
        # },
        # {
        #     "title": "Denim Jeans",
        #     "description": "Classic denim jeans with a modern slim fit for a timeless look.",
        #     "price": 49.99,
        # },
        # {
        #     "title": "Formal Suit",
        #     "description": "Elegant formal suit for special occasions, tailored for a perfect fit.",
        #     "price": 149.99,
        # },
        # {
        #     "title": "Smartwatch",
        #     "description": "Feature-packed smartwatch with fitness tracking and notification capabilities.",
        #     "price": 129.99,
        # },
        # {
        #     "title": "Travel Backpack",
        #     "description": "Durable and spacious travel backpack with multiple compartments.",
        #     "price": 79.99,
        # },
        # {
        #     "title": "Wireless Headphones",
        #     "description": "Premium wireless headphones with noise-canceling technology.",
        #     "price": 129.99,
        # },
        # {
        #     "title": "Sunglasses",
        #     "description": "Stylish sunglasses with UV protection for a fashionable and safe look.",
        #     "price": 34.99,
        # },
        # {
        #     "title": "Fitness Tracker",
        #     "description": "Slim fitness tracker to monitor your daily activity and health stats.",
        #     "price": 59.99,
        # },
        # {
        #     "title": "Leather Belt",
        #     "description": "Genuine leather belt with a classic buckle for a polished finishing touch.",
        #     "price": 24.99,
        # },
        # {
        #     "title": "Crossbody Bag",
        #     "description": "Versatile crossbody bag with adjustable straps for a comfortable fit.",
        #     "price": 39.99,
        # },
          
        # ]
    
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
