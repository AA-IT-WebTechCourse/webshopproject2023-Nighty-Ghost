from rest_framework import serializers
from .models import CartModel, Item
from django.contrib.auth.models import User

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartModel
        fields = "__all__"

class EditSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    

class SearchItemSerializer(serializers.Serializer):
    search = serializers.CharField(required=True)


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,style = {"input_type":"password"})
    
    

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={'input_type': 'password'})
    class Meta:
        model = User
        fields = ("username", "email", "password")

class ValidateCartDataSerializer(serializers.Serializer):
    def to_representation(self, data):
        return data

    def validate(self, data):
        #print("Serializer DATA IS : ", data) => OrderedDict() 
        for item in data:
            if not isinstance(item, dict):
                print(item, "is not", dict)
                raise serializers.ValidationError("Each item must be a dictionary.")
            if 'id' not in item or 'price' not in item:
                raise serializers.ValidationError("Each dictionary must contain 'id' and 'price' keys.")
        return data

class ValidateCartSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())

    def validate_items(self, items):
        for item_data in items:
            
            required_fields = ['id', 'added_time', 'added_by', 'added_item']
            for field in required_fields:
                if field not in item_data:
                    raise serializers.ValidationError(f"Field '{field}' is required for each item.")
             
            added_item_fields = ['id', 'title', 'description', 'price', 'date_added', 'is_sold', 'seller']
            added_item = item_data['added_item']
            for field in added_item_fields:
                if field not in added_item:
                    raise serializers.ValidationError(f"Field '{field}' is required inside 'added_item' for each item.")
            
            item_id = added_item['id']
            if not Item.objects.filter(id=item_id).exists():
                raise serializers.ValidationError(f"Item with id '{item_id}' does not exist.")

        return items

