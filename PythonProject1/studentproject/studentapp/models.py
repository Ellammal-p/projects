from django.db import models

class studentData(models.Model):
    name=models.CharField(max_length=50)
    email=models.EmailField(max_length=100)
    mobile=models.BigIntegerField()
    address=models.CharField(max_length=200)

# Create your models here.
