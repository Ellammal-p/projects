from django.shortcuts import render, redirect
from dapp.models import student
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def homepage(request):
    return render(request, 'form.html', {})

def save(request):
    name = request.POST['name']
    email = request.POST['email']
    mobile = request.POST['mobile']
    student.objects.create(name=name, email=email, mobile=mobile)
    return redirect('/')

@login_required(login_url='/login')
def show(request):
    data = student.objects.all()
    return render(request, 'showpage.html', {'list': data})

def edit(request, a):
    row = student.objects.get(id=a)
    return render(request, 'edit.html', {'list': row})

def update(request):
    stid = request.POST['id']
    up = student.objects.get(id=stid)
    up.name = request.POST['name']
    up.email = request.POST['email']
    up.mobile = request.POST['mobile']
    up.save()
    return redirect('show')

def delete(request, a):
    m = student.objects.get(id=a)
    m.delete()
    return redirect('show')

def login_page(request):
    return render(request, 'loginform.html')

def login_aut(request):
    uname = request.POST['username']
    upass = request.POST['userpassword']
    userdata = authenticate(request, username=uname, password=upass)
    if userdata is not None:
        login(request, userdata)
        messages.success(request, "Login successful")
        return redirect('show')
    else:
        messages.error(request, "Username or password incorrect")
        return redirect('login')

def logout_page(request):
    logout(request)
    messages.success(request, 'Successfully logged out')
    return redirect('login')
