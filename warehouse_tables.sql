create database warehouse

-- ==========================================
-- ROLES
-- ==========================================
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    
    CreatedAt DATETIME DEFAULT GETDATE()
);

insert into Roles (RoleName) values ('Admin'),('Staff'),('Tenant')

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    RoleID INT NOT NULL,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(150) UNIQUE,
    Phone BigInt,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Users_Roles
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);
-- ==========================================
-- TENANTS
-- ==========================================
CREATE TABLE Tenants (
    TenantID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    FullName VARCHAR(150) NOT NULL,
    CompanyName VARCHAR(150),
    Address VARCHAR(500),
    AadhaarNo VARCHAR(20),
    PANNo VARCHAR(20),
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Tenants_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ==========================================
-- WAREHOUSES
-- ==========================================
CREATE TABLE Warehouses (
    WarehouseID INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseCode VARCHAR(50) UNIQUE NOT NULL,
    WarehouseName VARCHAR(150) NOT NULL,
    Location VARCHAR(255),
    SizeSqFt DECIMAL(10,2),
    MonthlyRent DECIMAL(12,2),
    Status VARCHAR(50) DEFAULT 'Available',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- LEASES
-- ==========================================
CREATE TABLE Leases (
    LeaseID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,
    WarehouseID INT NOT NULL,
    LeaseStartDate DATE NOT NULL,
    LeaseEndDate DATE NOT NULL,
    MonthlyRent DECIMAL(12,2) NOT NULL,
    SecurityDeposit DECIMAL(12,2),
    LeaseStatus VARCHAR(50) DEFAULT 'Active',
    AgreementFilePath VARCHAR(500),

    CONSTRAINT FK_Leases_Tenants
    FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT FK_Leases_Warehouses
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- ==========================================
-- INVOICES
-- ==========================================
CREATE TABLE Invoices (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    LeaseID INT NOT NULL,
    InvoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    InvoiceDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    LateFee DECIMAL(12,2) DEFAULT 0,
    Status VARCHAR(50) DEFAULT 'Pending',

    CONSTRAINT FK_Invoices_Leases
    FOREIGN KEY (LeaseID) REFERENCES Leases(LeaseID)
);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    AmountPaid DECIMAL(12,2) NOT NULL,
    PaymentMethod VARCHAR(50),
    TransactionReference VARCHAR(100),
    PaymentStatus VARCHAR(50) DEFAULT 'Completed',

    CONSTRAINT FK_Payments_Invoices
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    NotificationType VARCHAR(50),
    Title VARCHAR(200),
    Message VARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ==========================================
-- STAFF
-- ==========================================
CREATE TABLE Staff (
    StaffID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Department VARCHAR(100),
    Designation VARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Staff_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ==========================================
-- TICKETS
-- ==========================================
CREATE TABLE Tickets (
    TicketID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,
    AssignedStaffID INT NULL,
    Subject VARCHAR(255) NOT NULL,
    Description VARCHAR(MAX),
    Priority VARCHAR(50) DEFAULT 'Medium',
    Status VARCHAR(50) DEFAULT 'Open',
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Tickets_Tenants
    FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT FK_Tickets_Staff
    FOREIGN KEY (AssignedStaffID) REFERENCES Staff(StaffID)
);

-- ==========================================
-- TICKET MESSAGES
-- ==========================================
CREATE TABLE TicketMessages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    TicketID INT NOT NULL,
    UserID INT NOT NULL,
    MessageText VARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_TicketMessages_Tickets
    FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID),

    CONSTRAINT FK_TicketMessages_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ==========================================
-- TICKET ATTACHMENTS
-- ==========================================
CREATE TABLE TicketAttachments (
    AttachmentID INT IDENTITY(1,1) PRIMARY KEY,
    TicketID INT NOT NULL,
    FileName VARCHAR(255),
    FilePath VARCHAR(500),
    UploadedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_TicketAttachments_Tickets
    FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID)
);

-- ==========================================
-- ACTIVITY LOGS
-- ==========================================
CREATE TABLE ActivityLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ActivityType VARCHAR(100),
    Description VARCHAR(MAX),
    ActivityDate DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_ActivityLogs_Users
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);