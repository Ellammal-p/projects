from django.db import models

class student(models.Model):
    name=models.CharField(max_length=30)
    email=models.EmailField(max_length=50)
    mobile=models.BigIntegerField()

    # Create your models here.
