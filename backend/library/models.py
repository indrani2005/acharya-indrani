from django.db import models

from django.db import models
from datetime import timedelta
from django.utils import timezone

class Book(models.Model):
    """Model for library books"""
    isbn = models.CharField(max_length=13, unique=True)
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    publisher = models.CharField(max_length=200)
    publication_year = models.IntegerField()
    category = models.CharField(max_length=100)
    total_copies = models.IntegerField()
    available_copies = models.IntegerField()
    shelf_location = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.title} by {self.author}"


class BookBorrowRecord(models.Model):
    """Model for book borrowing records"""
    
    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('lost', 'Lost'),
        ('damaged', 'Damaged'),
    ]
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    student = models.ForeignKey('users.StudentProfile', on_delete=models.CASCADE)
    borrowed_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    returned_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    issued_by = models.ForeignKey('users.StaffProfile', on_delete=models.CASCADE)
    
    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = timezone.now().date() + timedelta(days=14)  # 2 weeks
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.book.title} - {self.student.user.full_name}"
