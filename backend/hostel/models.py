from django.db import models

from django.db import models

class HostelBlock(models.Model):
    """Model for hostel blocks"""
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    warden = models.ForeignKey('users.StaffProfile', on_delete=models.SET_NULL, null=True)
    total_rooms = models.IntegerField()
    
    class Meta:
        unique_together = ['school', 'name']
        indexes = [
            models.Index(fields=['school', 'name']),
        ]
    
    def __str__(self):
        school_name = self.school.school_name if self.school else "No School"
        return f"{self.name} [{school_name}]"


class HostelRoom(models.Model):
    """Model for hostel rooms"""
    
    ROOM_TYPES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple'),
    ]
    
    block = models.ForeignKey(HostelBlock, on_delete=models.CASCADE)
    room_number = models.CharField(max_length=10)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES)
    capacity = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['block', 'room_number']
        indexes = [
            models.Index(fields=['block', 'room_number']),
            models.Index(fields=['block', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.block.name} - {self.room_number} [{self.block.school.school_name}]"


class HostelAllocation(models.Model):
    """Model for hostel room allocations"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('vacated', 'Vacated'),
        ('suspended', 'Suspended'),
    ]
    
    student = models.ForeignKey('users.StudentProfile', on_delete=models.CASCADE)
    room = models.ForeignKey(HostelRoom, on_delete=models.CASCADE)
    allocation_date = models.DateField()
    vacation_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    allocated_by = models.ForeignKey('users.StaffProfile', on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['room', 'status']),
            models.Index(fields=['allocation_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.user.full_name} - {self.room} [{self.room.block.school.school_name}]"


class HostelComplaint(models.Model):
    """Model for hostel complaints"""
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    student = models.ForeignKey('users.StudentProfile', on_delete=models.CASCADE)
    room = models.ForeignKey(HostelRoom, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    submitted_date = models.DateTimeField(auto_now_add=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey('users.StaffProfile', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['room', 'priority']),
            models.Index(fields=['submitted_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.student.user.full_name} [{self.room.block.school.school_name}]"
