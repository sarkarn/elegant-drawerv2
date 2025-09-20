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
      content: `actor Student
actor Librarian
actor Administrator

Student -> (Search Books)
Student -> (Borrow Book)
Student -> (Return Book)
Student -> (Renew Book)
Student -> (Reserve Book)
Student -> (Pay Fines)

Librarian -> (Search Books)
Librarian -> (Manage Inventory)
Librarian -> (Generate Reports)
Librarian -> (Help Students)

Administrator -> (Manage Users)
Administrator -> (Generate Reports)
Administrator -> (System Configuration)`
    },
    {
      name: "Online Banking System",
      description: "Banking application use cases for different user roles",
      content: `actor Customer
actor BankTeller
actor Manager

Customer -> (View Account Balance)
Customer -> (Transfer Money)
Customer -> (Pay Bills)
Customer -> (Apply for Loan)
Customer -> (Generate Statements)

BankTeller -> (Deposit Money)
BankTeller -> (Withdraw Money)
BankTeller -> (Open Account)
BankTeller -> (Close Account)
BankTeller -> (Manage Customer Accounts)

Manager -> (Approve Loans)
Manager -> (Manage Customer Accounts)
Manager -> (Generate Reports)
Manager -> (View Analytics)`
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
      name: "User Login Process",
      description: "Simple user authentication flowchart",
      content: `start -> input_credentials: Start Login
input_credentials -> validate: Enter Username/Password
validate -> check_db: Validate Credentials
check_db -> valid?: Check Database
valid? -> success: [Yes] Valid Credentials
valid? -> retry: [No] Invalid Credentials
success -> dashboard: Login Successful
retry -> attempts?: Check Attempts
attempts? -> locked: [3+] Account Locked
attempts? -> input_credentials: [<3] Try Again
locked -> contact_admin: Contact Administrator
dashboard -> end: Access Granted
contact_admin -> end: Process Complete`
    },
    {
      name: "Order Processing Workflow",
      description: "E-commerce order processing flowchart",
      content: `start -> receive_order: New Order Received
receive_order -> check_inventory: Check Product Availability
check_inventory -> in_stock?: Items Available?
in_stock? -> process_payment: [Yes] Process Payment
in_stock? -> backorder: [No] Create Backorder
process_payment -> payment_ok?: Payment Successful?
payment_ok? -> ship_order: [Yes] Prepare Shipment
payment_ok? -> payment_failed: [No] Payment Failed
ship_order -> tracking: Generate Tracking Number
tracking -> notify_customer: Send Confirmation Email
notify_customer -> end: Order Complete
payment_failed -> retry_payment: Retry Payment
retry_payment -> process_payment: Process Again
backorder -> notify_delay: Notify Customer of Delay
notify_delay -> end: Wait for Restock`
    }
  ]
};

export const getExamplesForType = (type: DiagramType): DiagramExample[] => {
  return diagramExamples[type] || [];
};

export const getExampleNames = (type: DiagramType): string[] => {
  return getExamplesForType(type).map(example => example.name);
};