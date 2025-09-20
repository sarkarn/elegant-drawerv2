import type { DiagramType } from '../types/diagram';

export interface DiagramExample {
  name: string;
  description: string;
  content: string;
}

export const diagramExamples: Record<DiagramType, DiagramExample[]> = {
  class: [
    {
      name: "Basic Library System",
      description: "A simple library management system with books, users, and lending",
      content: `class Book {
  - title: string
  - author: string
  - isbn: string
  - isAvailable: boolean
  + borrow(): void
  + return(): void
  + getInfo(): string
}

class User {
  - name: string
  - id: number
  - email: string
  - borrowedBooks: Book[]
  + borrowBook(book: Book): boolean
  + returnBook(book: Book): void
  + getProfile(): UserProfile
}

class Library {
  - books: Book[]
  - users: User[]
  - librarian: Librarian
  + addBook(book: Book): void
  + removeBook(isbn: string): void
  + findBook(title: string): Book[]
  + registerUser(user: User): void
}

class Librarian {
  - employeeId: string
  - permissions: string[]
  + manageInventory(): void
  + generateReports(): Report[]
  + helpUser(user: User): void
}`
    },
    {
      name: "E-commerce System",
      description: "Online shopping platform with products, orders, and payments",
      content: `class Product {
  - id: string
  - name: string
  - price: number
  - stock: number
  - category: Category
  + updatePrice(newPrice: number): void
  + checkAvailability(): boolean
  + addToCart(): void
}

class Customer {
  - customerId: string
  - name: string
  - email: string
  - address: Address
  - cart: ShoppingCart
  + placeOrder(): Order
  + viewOrderHistory(): Order[]
  + updateProfile(): void
}

class Order {
  - orderId: string
  - customer: Customer
  - items: OrderItem[]
  - status: OrderStatus
  - totalAmount: number
  + calculateTotal(): number
  + processPayment(): boolean
  + updateStatus(status: OrderStatus): void
}

class ShoppingCart {
  - items: CartItem[]
  - customer: Customer
  + addItem(product: Product, quantity: number): void
  + removeItem(productId: string): void
  + checkout(): Order
  + getTotalPrice(): number
}`
    }
  ],

  sequence: [
    {
      name: "User Login Process",
      description: "Authentication flow showing user login with validation",
      content: `User -> LoginPage: enters credentials
LoginPage -> AuthService: validateCredentials(username, password)
AuthService -> Database: checkUserExists(username)
Database -> AuthService: userRecord
AuthService -> PasswordService: verifyPassword(password, hashedPassword)
PasswordService -> AuthService: isValid
AuthService -> TokenService: generateToken(userId)
TokenService -> AuthService: authToken
AuthService -> LoginPage: loginSuccess(token)
LoginPage -> User: redirectToDashboard()
User -> Dashboard: accessProtectedContent()`
    },
    {
      name: "Online Order Processing",
      description: "E-commerce order flow from cart to payment completion",
      content: `Customer -> ShoppingCart: reviewItems()
ShoppingCart -> Customer: displayCartSummary()
Customer -> CheckoutPage: proceedToCheckout()
CheckoutPage -> PaymentService: initiatePayment(orderDetails)
PaymentService -> PaymentGateway: processPayment(cardInfo, amount)
PaymentGateway -> Bank: authorizeTransaction()
Bank -> PaymentGateway: transactionApproved
PaymentGateway -> PaymentService: paymentSuccess(transactionId)
PaymentService -> OrderService: createOrder(orderDetails, transactionId)
OrderService -> InventoryService: updateStock(items)
InventoryService -> OrderService: stockUpdated
OrderService -> NotificationService: sendOrderConfirmation(customer)
NotificationService -> Customer: orderConfirmationEmail()`
    }
  ],

  usecase: [
    {
      name: "Library Management System",
      description: "Use cases for a digital library system",
      content: `User: Student
User: Librarian
User: Administrator

UseCase: Search Books
UseCase: Borrow Book
UseCase: Return Book
UseCase: Renew Book
UseCase: Reserve Book
UseCase: Manage Inventory
UseCase: Generate Reports
UseCase: Manage Users
UseCase: Pay Fines

Student -> Search Books
Student -> Borrow Book
Student -> Return Book
Student -> Renew Book
Student -> Reserve Book
Student -> Pay Fines

Librarian -> Search Books
Librarian -> Manage Inventory
Librarian -> Generate Reports
Librarian -> Help Students

Administrator -> Manage Users
Administrator -> Generate Reports
Administrator -> System Configuration`
    },
    {
      name: "Online Banking System",
      description: "Banking application use cases for different user roles",
      content: `User: Customer
User: Bank Teller
User: Manager

UseCase: View Account Balance
UseCase: Transfer Money
UseCase: Pay Bills
UseCase: Apply for Loan
UseCase: Deposit Money
UseCase: Withdraw Money
UseCase: Open Account
UseCase: Close Account
UseCase: Generate Statements
UseCase: Approve Loans
UseCase: Manage Customer Accounts

Customer -> View Account Balance
Customer -> Transfer Money
Customer -> Pay Bills
Customer -> Apply for Loan
Customer -> Generate Statements

Bank Teller -> Deposit Money
Bank Teller -> Withdraw Money
Bank Teller -> Open Account
Bank Teller -> Close Account
Bank Teller -> Manage Customer Accounts

Manager -> Approve Loans
Manager -> Manage Customer Accounts
Manager -> Generate Reports`
    }
  ],

  mindmap: [
    {
      name: "Web Development Technologies",
      description: "Overview of modern web development stack and technologies",
      content: `Web Development
  Frontend
    Frameworks
      React
        Hooks
        Context
        Redux
      Vue.js
        Composition API
        Vuex
        Router
      Angular
        Components
        Services
        RxJS
    Languages
      JavaScript
        ES6+
        TypeScript
        Promises
        Async/Await
      CSS
        Flexbox
        Grid
        Animations
        Preprocessors
          Sass
          Less
      HTML
        Semantic Elements
        Accessibility
        Forms
  Backend
    Languages
      Node.js
        Express
        Fastify
        NestJS
      Python
        Django
        Flask
        FastAPI
      Java
        Spring Boot
        Hibernate
      C#
        .NET Core
        Entity Framework
    Databases
      SQL
        PostgreSQL
        MySQL
        SQLite
      NoSQL
        MongoDB
        Redis
        Cassandra
  DevOps
    Cloud Platforms
      AWS
        EC2
        S3
        Lambda
      Azure
        App Service
        Functions
        Storage
      Google Cloud
        Compute Engine
        Cloud Functions
        Cloud Storage
    Containers
      Docker
        Images
        Containers
        Compose
      Kubernetes
        Pods
        Services
        Deployments`
    },
    {
      name: "Project Management",
      description: "Key aspects of effective project management",
      content: `Project Management
  Planning
    Scope Definition
      Requirements Gathering
      Stakeholder Analysis
      Success Criteria
    Timeline
      Milestones
      Dependencies
      Critical Path
    Resources
      Team Members
      Budget
      Tools
  Execution
    Team Management
      Communication
      Delegation
      Motivation
    Risk Management
      Risk Assessment
      Mitigation Strategies
      Contingency Plans
    Quality Control
      Testing
      Reviews
      Standards
  Monitoring
    Progress Tracking
      KPIs
      Metrics
      Reports
    Budget Control
      Cost Tracking
      Variance Analysis
      Forecasting
    Stakeholder Communication
      Status Updates
      Meeting Minutes
      Documentation
  Methodologies
    Agile
      Scrum
        Sprints
        Stand-ups
        Retrospectives
      Kanban
        Boards
        WIP Limits
        Flow
    Waterfall
      Sequential Phases
      Documentation
      Sign-offs
    Hybrid
      Flexibility
      Adaptation
      Best Practices`
    }
  ],

  flow: [
    {
      name: "Customer Support Workflow",
      description: "Process flow for handling customer support tickets",
      content: `Start -> Ticket Received
Ticket Received -> Categorize Issue
Categorize Issue -> Technical Issue?
Technical Issue? -> [Yes] Assign to Tech Team
Technical Issue? -> [No] Assign to Support Team
Assign to Tech Team -> Technical Analysis
Assign to Support Team -> Support Analysis
Technical Analysis -> Complex Issue?
Support Analysis -> Escalation Needed?
Complex Issue? -> [Yes] Escalate to Senior Tech
Complex Issue? -> [No] Implement Solution
Escalation Needed? -> [Yes] Escalate to Manager
Escalation Needed? -> [No] Provide Solution
Escalate to Senior Tech -> Senior Technical Review
Escalate to Manager -> Manager Review
Senior Technical Review -> Implement Solution
Manager Review -> Provide Solution
Implement Solution -> Test Solution
Provide Solution -> Customer Satisfied?
Test Solution -> Solution Works?
Solution Works? -> [Yes] Deploy to Production
Solution Works? -> [No] Revise Solution
Deploy to Production -> Customer Satisfied?
Customer Satisfied? -> [Yes] Close Ticket
Customer Satisfied? -> [No] Further Investigation
Revise Solution -> Implement Solution
Further Investigation -> Technical Analysis
Close Ticket -> End`
    },
    {
      name: "Software Deployment Pipeline",
      description: "CI/CD pipeline for software deployment",
      content: `Start -> Code Commit
Code Commit -> Trigger CI Pipeline
Trigger CI Pipeline -> Run Unit Tests
Run Unit Tests -> Tests Passed?
Tests Passed? -> [No] Notify Developer
Tests Passed? -> [Yes] Build Application
Notify Developer -> Fix Issues
Fix Issues -> Code Commit
Build Application -> Build Successful?
Build Successful? -> [No] Build Failed
Build Successful? -> [Yes] Run Integration Tests
Build Failed -> Notify Developer
Run Integration Tests -> Integration Tests Passed?
Integration Tests Passed? -> [No] Investigate Failures
Integration Tests Passed? -> [Yes] Security Scan
Investigate Failures -> Fix Issues
Security Scan -> Security Issues Found?
Security Issues Found? -> [Yes] Address Security Issues
Security Issues Found? -> [No] Deploy to Staging
Address Security Issues -> Security Scan
Deploy to Staging -> Staging Tests
Staging Tests -> Staging Tests Passed?
Staging Tests Passed? -> [No] Debug Staging Issues
Staging Tests Passed? -> [Yes] Manual Approval Required?
Debug Staging Issues -> Fix Issues
Manual Approval Required? -> [Yes] Request Approval
Manual Approval Required? -> [No] Deploy to Production
Request Approval -> Approval Granted?
Approval Granted? -> [No] End
Approval Granted? -> [Yes] Deploy to Production
Deploy to Production -> Production Health Check
Production Health Check -> Healthy?
Healthy? -> [No] Rollback
Healthy? -> [Yes] Notify Success
Rollback -> Previous Version
Previous Version -> End
Notify Success -> End`
    }
  ]
};

export const getExamplesForType = (type: DiagramType): DiagramExample[] => {
  return diagramExamples[type] || [];
};

export const getExampleNames = (type: DiagramType): string[] => {
  return getExamplesForType(type).map(example => example.name);
};