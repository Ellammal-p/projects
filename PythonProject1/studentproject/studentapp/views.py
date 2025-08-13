from django.shortcuts import render, redirect

from studentapp.models import studentData



def registration(request):
    return render(request,'student_form.html',{})

def save(request):
    name=request.POST['name']
    email=request.POST['email']
    mobile=request.POST['mobile']
    address=request.POST['address']
    studentData.objects.create(name=name,email=email,mobile=mobile,address=address)
    return redirect('/')

def show(request):
    data=studentData.objects.all()
    return render(request,'studentlist.html',{'list':data})
# Create your views here.
