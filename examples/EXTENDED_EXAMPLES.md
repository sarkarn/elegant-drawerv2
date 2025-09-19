# Extended Diagram Examples

This collection provides comprehensive examples for all supported diagram types in the Elegant Drawer v2 application. Each example demonstrates different complexity levels and real-world scenarios.

## Class Diagram Examples

### 1. Basic Class Diagram (`class.txt`)
- Simple inheritance hierarchy
- Basic attributes and methods
- Visibility indicators (+, -, #)

### 2. Advanced E-commerce System (`class-advanced.txt`)
- Complex inheritance relationships
- Multiple class types (Product, User, Customer, Admin)
- Real-world e-commerce domain model
- Composition and aggregation relationships

### 3. Library Management System (`class-library.txt`)
- Academic domain example
- Multiple inheritance (Student, Faculty extending Member)
- Transaction and reservation system
- Demonstrates library operations workflow

### 4. Banking System (`class-banking.txt`)
- Financial domain model
- Account hierarchy (Savings, Checking)
- Complex relationships between customers, accounts, and transactions
- ATM and credit card integration

## Sequence Diagram Examples

### 1. Basic Sequence Diagram (`sequence.txt`)
- Simple actor interactions
- Synchronous and asynchronous messages
- Basic conversation flow

### 2. Online Shopping Workflow (`sequence-shopping.txt`)
- Complete e-commerce transaction flow
- Multiple system components interaction
- Payment gateway integration
- Order processing and fulfillment

### 3. User Authentication System (`sequence-auth.txt`)
- Registration and login process
- Email verification workflow
- JWT token management
- Session handling

### 4. ATM Transaction Process (`sequence-atm.txt`)
- Banking transaction workflow
- Card validation and PIN verification
- Balance checking and cash dispensing
- Notification and receipt generation

## Flow Diagram Examples

### 1. Basic Flow Diagram (`flow.txt`)
- Simple decision flow
- Start and end nodes
- Basic process flow

### 2. Software Development Lifecycle (`flow-sdlc.txt`)
- Complete SDLC process
- Multiple decision points
- Testing and deployment phases
- Bug fixing and maintenance loops

### 3. Order Processing System (`flow-order.txt`)
- E-commerce order workflow
- Stock checking and reservation
- Payment processing
- Shipping and tracking

### 4. Emergency Response System (`flow-emergency.txt`)
- Emergency call handling
- Different emergency types routing
- Backup and escalation procedures
- Documentation and follow-up

## Use Case Diagram Examples

### 1. Basic Use Case Diagram (`usecase.txt`)
- Simple actor-use case relationships
- Basic system functionality
- User and admin roles

### 2. University Management System (`usecase-university.txt`)
- Multiple actor types (Student, Faculty, Admin, Registrar, Librarian)
- Academic management functions
- Library system integration
- Administrative workflows

### 3. E-commerce Platform (`usecase-ecommerce.txt`)
- Customer, seller, and admin perspectives
- Payment processor integration
- Shipping provider interaction
- Complete marketplace functionality

### 4. Hospital Management System (`usecase-hospital.txt`)
- Healthcare domain example
- Multiple healthcare roles
- Patient care workflow
- Medical record management

## Mindmap Examples

### 1. Basic Mindmap (`mindmap.txt`)
- Simple hierarchical structure
- Two-space indentation
- Basic branching

### 2. Software Development Project Planning (`mindmap-project.txt`)
- Comprehensive project planning structure
- Multiple levels of detail
- Development lifecycle phases
- Technical and management aspects

### 3. Digital Marketing Strategy (`mindmap-marketing.txt`)
- Marketing strategy breakdown
- SEO and content marketing
- Social media and paid advertising
- Analytics and measurement

### 4. Personal Learning and Development (`mindmap-learning.txt`)
- Technical and soft skills development
- Learning methods and resources
- Career planning structure
- Industry knowledge areas

## Usage Instructions

1. **Copy and Paste**: Copy the content from any example file
2. **Select Diagram Type**: Choose the appropriate diagram type in the application
3. **Paste Content**: Paste the example code into the input panel
4. **Render**: Click the render button to generate the diagram

## Syntax Guidelines

### Class Diagrams
```
class ClassName {
  +public_attribute: Type
  -private_attribute: Type
  #protected_attribute: Type
  +public_method(): ReturnType
  -private_method(param: Type): ReturnType
}

class Child extends Parent {
  // Additional members
}
```

### Sequence Diagrams
```
Actor1 -> Actor2: Synchronous message
Actor1 --> Actor2: Asynchronous message
Actor2 --> Actor1: Response message
```

### Flow Diagrams
```
start -> process: Label
process -> decision: Question
decision -> end1: Yes
decision -> end2: No
```

### Use Case Diagrams
```
actor ActorName

ActorName -> (Use Case Name)
ActorName -> (Another Use Case)
```

### Mindmaps
```
Central Topic
  Branch 1
    Sub-branch 1.1
    Sub-branch 1.2
  Branch 2
    Sub-branch 2.1
```

## Tips for Creating Effective Diagrams

1. **Keep it Simple**: Start with basic examples and add complexity gradually
2. **Use Meaningful Names**: Choose descriptive names for classes, actors, and processes
3. **Follow Conventions**: Use standard UML notation and naming conventions
4. **Test Incrementally**: Build diagrams step by step to identify parsing issues
5. **Use Real-world Examples**: Base diagrams on actual business scenarios for better understanding

## Contributing

Feel free to add more examples by creating new files following the naming convention:
- `{diagram-type}-{scenario-name}.txt`

Examples should be well-commented and demonstrate specific features or use cases.