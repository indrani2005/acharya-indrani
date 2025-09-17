# Acharya ERP Documentation

Welcome to the comprehensive documentation for the Acharya Multi-School Management System. This documentation provides detailed information about the system's architecture, APIs, and deployment procedures.

## 📚 Documentation Overview

The Acharya ERP system is a comprehensive Educational Resource Planning platform designed for multi-school management in Rajasthan. It features a modern architecture with Django REST Framework backend and React TypeScript frontend, supporting complex admission workflows, fee management, and administrative operations.

## 🏗️ [System Architecture](ARCHITECTURE.md)
**Complete system design and implementation details**

- **Technology Stack**: Django 5.0+ with DRF, React 18+ with TypeScript, PostgreSQL/SQLite
- **Backend Architecture**: 15+ Django apps with JWT authentication and role-based access
- **Frontend Architecture**: Modern React with shadcn/ui components and Tailwind CSS
- **Database Schema**: Comprehensive models for users, schools, admissions, and academic management
- **Key Features**: Multi-school admission workflow, category-based fee system, real-time status tracking
- **Security Model**: JWT tokens, role-based permissions, input validation, file upload security
- **Performance**: Database optimization, API pagination, caching strategies

**Core Applications:**
- **Users & Schools**: Multi-role authentication with school-specific access
- **Admissions**: Complete workflow from email verification to enrollment
- **Academic Management**: Students, staff, fees, attendance, exams, hostel, library
- **System Features**: Notifications, reports, analytics, dashboards

## 🔌 [API Reference](API_REFERENCE.md)
**Comprehensive API documentation with examples**

- **Authentication APIs**: JWT login/logout, user management, role-based access
- **Admission APIs**: Email verification, application submission, tracking, enrollment
- **Admin APIs**: Dashboard data, application review, decision management
- **School Management**: Statistics, configurations, multi-school support
- **Academic APIs**: Student management, fee calculation, attendance, exams
- **File Management**: Document upload, secure file serving, validation

**API Features:**
- RESTful design with consistent JSON responses
- JWT authentication with token blacklisting
- Role-based permissions per endpoint
- File upload support with security validation
- Comprehensive error handling and status codes
- Rate limiting and pagination support

## 🚀 [Deployment Guide](DEPLOYMENT.md)
**Complete setup instructions for development and production**

### Development Setup
- **Prerequisites**: Python 3.11+, Node.js 18+, UV package manager, Bun runtime
- **Backend**: Django development server with SQLite database
- **Frontend**: Vite development server with hot reload
- **Environment**: Local configuration with CORS and debug settings

### Production Deployment
- **Server Requirements**: Ubuntu 22.04+, PostgreSQL 15+, Nginx 1.18+
- **Security**: SSL certificates, firewall configuration, fail2ban protection
- **Process Management**: Systemd services with auto-restart and monitoring
- **Performance**: Database optimization, static file caching, log rotation
- **Maintenance**: Backup strategies, update procedures, health monitoring

**Deployment Features:**
- Automated SSL certificate management with Let's Encrypt
- Production-grade security headers and CORS configuration
- Database migration and static file management
- Comprehensive logging and error tracking
- Backup automation with retention policies

## 🎯 Key System Features

### Multi-School Admission System
- **Email Verification**: OTP-based verification before application submission
- **School Preferences**: Students can apply to up to 3 schools in preference order
- **Independent Review**: Each school reviews and decides on applications separately
- **Student Choice**: Students can choose from multiple accepted schools
- **Enrollment Tracking**: Complete enrollment/withdrawal workflow with date tracking

### Category-Based Fee Management
- **Dynamic Calculation**: Fee calculation based on class (1-8, 9-10, 11-12) and category (General, SC/ST/OBC/SBC)
- **Flexible Structures**: Support for fee ranges and fixed amounts
- **Real-time Display**: Frontend integration with immediate fee calculation
- **Payment Integration**: Payment initialization and tracking workflow

### Administrative Dashboard
- **Role-based Access**: Different dashboards for Admin, Student, Parent, Faculty, Warden
- **Real-time Updates**: Live application status and enrollment tracking
- **Bulk Operations**: Efficient handling of multiple applications and decisions
- **Comprehensive Reporting**: Analytics and reports across all system modules

### Document Management
- **Secure Upload**: File validation with type and size restrictions
- **Document Serving**: Secure file access with proper authentication
- **Storage Management**: Organized document storage with backup support

## 🛠️ Development Information

### Recent Enhancements
- **Fixed Fee Calculation**: Improved regex-based course parsing for accurate fee mapping (class-12 → 11-12 range)
- **Enhanced Status Display**: Comprehensive status aggregation across multiple schools
- **TypeScript Error Resolution**: Fixed missing function scope issues in AdminDashboard
- **Documentation Cleanup**: Consolidated 30+ files into 3 comprehensive documents

### Technology Choices
- **UV Package Manager**: Modern Python dependency management
- **Bun Runtime**: Fast JavaScript runtime and package manager
- **shadcn/ui Components**: Modern, accessible UI component library
- **JWT Authentication**: Secure token-based authentication with blacklisting
- **PostgreSQL**: Production-grade database with proper indexing

## 📞 Support & Maintenance

### Monitoring
- Application health checks and automated restart procedures
- Comprehensive logging across all system components
- Database performance monitoring and optimization
- SSL certificate auto-renewal and security monitoring

### Backup & Recovery
- Automated daily database backups with 7-day retention
- Media file backup and restoration procedures
- Database migration and rollback strategies

### Security
- Regular security updates and dependency management
- Input validation and sanitization across all endpoints
- File upload security with virus scanning capability
- Rate limiting and DDoS protection measures

---

**System Status**: Production Ready ✅  
**Last Updated**: January 2025  
**Version**: 1.0.0  

For technical support or questions about implementation, refer to the specific documentation sections above or review the troubleshooting sections in the Deployment Guide.
- **[TODO](./TODO.md)** - Current development tasks and future enhancements

## 🎯 Project Overview

The Acharya Education Portal is a comprehensive school management system designed specifically for the Government of Rajasthan. It provides:

### 🏫 Multi-School Support
- **School Isolation**: Each school operates independently with its own data
- **Centralized Management**: Government oversight and control
- **Scalable Architecture**: Supports unlimited schools

## 🎯 Quick Navigation

### For Developers
- Start with the [Architecture Guide](ARCHITECTURE.md) to understand the system
- Review [API Documentation](API_DOCUMENTATION.md) for backend integration
- Follow [Testing Guide](TESTING.md) for development best practices

### For DevOps/System Administrators
- Use the [Deployment Guide](DEPLOYMENT.md) for production setup
- Reference security sections in [Architecture Guide](ARCHITECTURE.md)
- Follow monitoring guidelines in [Deployment Guide](DEPLOYMENT.md)

### For Project Managers
- Review system overview in [Architecture Guide](ARCHITECTURE.md)
- Check feature coverage in [API Documentation](API_DOCUMENTATION.md)
- Understand deployment requirements in [Deployment Guide](DEPLOYMENT.md)

## 📋 Documentation Standards

### Format
- All documentation is written in Markdown format
- Code examples include proper syntax highlighting
- Screenshots and diagrams are included where helpful
- API examples include both request and response formats

### Maintenance
- Documentation is updated with each major feature release
- All API changes are reflected in the API documentation
- Deployment guides are tested with each release
- Testing documentation includes new testing patterns

### Contribution
- Documentation follows the same review process as code
- Technical writers review all documentation changes
- Examples are tested and validated before publication

## 🔄 Document Versions

- **Version 1.0** - Initial comprehensive documentation suite
- **Current** - Aligned with system version 1.0
- **Next Release** - Will include additional features and improvements

## � Support

For documentation-related questions:
- Create an issue in the project repository
- Tag issues with `documentation` label
- Reference specific documentation sections in bug reports

## 🗺️ Documentation Roadmap

### Planned Additions
- **User Guides** - End-user documentation for students, parents, and administrators
- **Integration Guides** - Third-party service integration documentation
- **Migration Guides** - Data migration and system upgrade documentation
- **Troubleshooting Database** - Searchable issue resolution database
- **Video Tutorials** - Visual guides for complex procedures

### Improvements
- Interactive API documentation with live examples
- Automated testing of documentation code examples
- Multi-language documentation support
- Mobile-friendly documentation format

---

*This documentation is maintained by the Acharya ERP development team and is updated regularly to reflect the current state of the system.*
- Auto-generation of admission numbers (5-digit format)
- Email format standardization across all roles

## 🚧 Development Workflow

1. **Local Setup**: Follow the Quick Start Integration guide
2. **Backend Development**: Use UV for package management
3. **Frontend Development**: Vite dev server with hot reload
4. **Testing**: Management commands for testing features
5. **Migration**: Always test migrations in development first

## 📞 Support & Contributing

For development questions or issues:
1. Check the Issue Resolution Summary
2. Review the API Reference for endpoint details
3. Consult the Migration Troubleshooting guide for database issues

## � Project Organization

### Documentation Structure
All documentation is organized in the `docs/` folder with three main documents:
- **ARCHITECTURE.md**: System design, features, and technical implementation
- **API_REFERENCE.md**: Complete API documentation with examples
- **DEPLOYMENT.md**: Setup and deployment instructions

### Test Structure
All test files are organized in the `backend/test/` folder:
- **Test Scripts**: Data validation and enrollment logic testing
- **Debug Tools**: Application status and data consistency verification
- **Cleanup Scripts**: Database maintenance and data repair utilities

### Future Development Guidelines
- **Documentation**: All new documentation should be added to the `docs/` folder
- **Testing**: All test files should be placed in the `backend/test/` folder
- **Integration**: Related markdown files should be consolidated into the main docs
- **Organization**: Keep project structure clean and well-organized

## �📄 License

This project is developed for the Government of Rajasthan and follows government software development guidelines.

---

*Last Updated: September 2025*
*Version: 1.0.0*