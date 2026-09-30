import { ArchitectureBlueprint } from '../types';

export const ARCHITECTURE_BLUEPRINTS: ArchitectureBlueprint[] = [
  {
    id: 'serverless-web-app',
    title: 'Serverless Fullstack Web Application',
    category: 'Serverless & Web',
    difficulty: 'Beginner',
    description: 'A modern, zero-server-maintenance architecture for high-scale web apps with single-digit millisecond latency and pay-per-use economics.',
    wellArchitectedPillar: 'Cost Optimization & Performance Efficiency',
    costEstimator: 'Under $5/month for low-to-medium traffic (often $0 within AWS Free Tier). Scales to millions of requests automatically.',
    dataFlowSteps: [
      '1. User types URL; Route 53 resolves DNS to Amazon CloudFront global edge network.',
      '2. CloudFront serves cached React/Vue/Next.js frontend assets securely from Amazon S3 (Origin Access Control).',
      '3. User logs in; Amazon Cognito authenticates user and issues secure JWT tokens.',
      '4. Frontend invokes REST / GraphQL API endpoints through Amazon API Gateway with JWT validation.',
      '5. API Gateway triggers AWS Lambda compute functions to execute business logic.',
      '6. Lambda functions read and write user data directly in Amazon DynamoDB.'
    ],
    keyServices: ['Amazon CloudFront', 'Amazon S3', 'Amazon API Gateway', 'AWS Lambda', 'Amazon DynamoDB', 'Amazon Cognito'],
    nodes: [
      {
        id: 'node-r53',
        name: 'Amazon Route 53',
        service: 'Route 53',
        category: 'DNS & Traffic Routing',
        role: 'Global DNS routing pointing domain apex to CloudFront distribution.',
        details: 'Uses Alias record for latency-based routing with 100% SLA and zero DNS query charges.',
        securityTip: 'Configure DNSSEC to protect users from DNS spoofing and cache poisoning attacks.',
        iconName: 'Compass',
        x: 5,
        y: 50
      },
      {
        id: 'node-cf',
        name: 'Amazon CloudFront',
        service: 'CloudFront',
        category: 'Content Delivery Network (CDN)',
        role: 'Terminates SSL/TLS at 600+ edge locations worldwide and caches static assets.',
        details: 'Integrates with AWS WAF for Layer 7 DDoS and bot protection.',
        securityTip: 'Enforce Origin Access Control (OAC) so direct access to the S3 bucket is completely blocked.',
        iconName: 'Globe',
        x: 23,
        y: 30
      },
      {
        id: 'node-s3',
        name: 'Amazon S3',
        service: 'S3 (Static Assets)',
        category: 'Storage',
        role: 'Houses compiled HTML, CSS, JavaScript, fonts, and images.',
        details: 'Configured as private bucket with S3 Versioning enabled to rollback faulty releases.',
        securityTip: 'Enable "Block Public Access" at the bucket level; only allow CloudFront via bucket policy.',
        iconName: 'HardDrive',
        x: 23,
        y: 75
      },
      {
        id: 'node-apigw',
        name: 'Amazon API Gateway',
        service: 'API Gateway',
        category: 'API Management',
        role: 'Front door for backend APIs; handles rate limiting, CORS, and auth validation.',
        details: 'Transforms HTTP requests, provides Swagger/OpenAPI support, and throttles abuse.',
        securityTip: 'Use Cognito User Pool Authorizer to reject unauthenticated requests before invoking Lambda.',
        iconName: 'Workflow',
        x: 48,
        y: 30
      },
      {
        id: 'node-cognito',
        name: 'Amazon Cognito',
        service: 'Cognito',
        category: 'Identity & Auth',
        role: 'Handles user sign-up, sign-in, MFA, social federation, and token vending.',
        details: 'Issues JWT ID, Access, and Refresh tokens adhering to OAuth 2.0 standards.',
        securityTip: 'Enable adaptive authentication and compromised credentials detection.',
        iconName: 'ShieldCheck',
        x: 48,
        y: 75
      },
      {
        id: 'node-lambda',
        name: 'AWS Lambda',
        service: 'Lambda Functions',
        category: 'Compute',
        role: 'Executes backend business logic statelessly in ephemeral micro-containers.',
        details: 'Autoscales instantly from 0 to thousands of executions; billed per 1ms.',
        securityTip: 'Assign an IAM Execution Role with least-privilege access restricted only to the DynamoDB table.',
        iconName: 'Zap',
        x: 73,
        y: 30
      },
      {
        id: 'node-dynamo',
        name: 'Amazon DynamoDB',
        service: 'DynamoDB',
        category: 'NoSQL Database',
        role: 'Persists application state, accounts, orders, and telemetry with single-digit ms response.',
        details: 'Uses On-Demand capacity mode with point-in-time recovery (PITR) enabled.',
        securityTip: 'Enable Encryption at Rest with AWS KMS and VPC Endpoints for private routing.',
        iconName: 'Database',
        x: 92,
        y: 50
      }
    ],
    connections: [
      { from: 'node-r53', to: 'node-cf', label: 'DNS Resolution' },
      { from: 'node-cf', to: 'node-s3', label: 'Fetch Static Assets' },
      { from: 'node-cf', to: 'node-apigw', label: 'Route /api/* Requests' },
      { from: 'node-apigw', to: 'node-cognito', label: 'Validate JWT Auth' },
      { from: 'node-apigw', to: 'node-lambda', label: 'Invoke Backend Logic' },
      { from: 'node-lambda', to: 'node-dynamo', label: 'Query & Put Item' }
    ]
  },
  {
    id: 'ha-3tier-web-app',
    title: 'Highly Available Multi-AZ 3-Tier Enterprise Web App',
    category: 'Enterprise & Resilience',
    difficulty: 'Intermediate',
    description: 'The canonical AWS Well-Architected enterprise workload: redundant public web tier, private compute application tier, and isolated Multi-AZ database tier.',
    wellArchitectedPillar: 'Reliability & Security',
    costEstimator: '~$60 - $180/month depending on EC2 and RDS instance sizes, NAT Gateways, and data transfer.',
    dataFlowSteps: [
      '1. User sends HTTPS request to domain; Route 53 routes to Application Load Balancer (ALB).',
      '2. ALB resides in Public Subnets across 2 Availability Zones; performs SSL offloading and health checks.',
      '3. ALB distributes traffic evenly to EC2 Auto Scaling fleet in Private Subnets (no public IPs).',
      '4. EC2 instances download external OS security updates via high-availability NAT Gateways.',
      '5. Backend application queries Amazon Aurora / RDS PostgreSQL deployed in Multi-AZ configuration in isolated DB subnets.',
      '6. Redis ElastiCache cluster provides sub-millisecond query caching.'
    ],
    keyServices: ['Amazon Route 53', 'Application Load Balancer (ALB)', 'Amazon EC2 Auto Scaling', 'Amazon RDS Multi-AZ', 'Amazon VPC NAT Gateway', 'Amazon ElastiCache'],
    nodes: [
      {
        id: 'node-r53-3t',
        name: 'Amazon Route 53',
        service: 'Route 53',
        category: 'DNS',
        role: 'Global DNS routing with health-check failover to Application Load Balancer.',
        details: 'Uses Alias A record pointing to the dual-stack ALB DNS name.',
        securityTip: 'Set up health checks with active notification alerts.',
        iconName: 'Compass',
        x: 6,
        y: 50
      },
      {
        id: 'node-alb-3t',
        name: 'Application Load Balancer',
        service: 'ALB (Public Subnet)',
        category: 'Networking & Load Balancing',
        role: 'Public internet-facing load balancer spanning Availability Zones (AZ-a & AZ-b).',
        details: 'Terminates HTTPS traffic using ACM certificates, inspects HTTP headers, and balances load.',
        securityTip: 'Attach AWS WAF to block SQL injection and cross-site scripting (XSS) at the perimeter.',
        iconName: 'Shuffle',
        x: 25,
        y: 50
      },
      {
        id: 'node-nat-3t',
        name: 'NAT Gateways',
        service: 'NAT Gateway (Public Subnet)',
        category: 'VPC Networking',
        role: 'Allows instances in private subnets outbound internet access for patches and 3P APIs.',
        details: 'Deployed one per AZ for high availability, paired with Elastic IPs.',
        securityTip: 'Use VPC Endpoints for S3 to avoid paying NAT Gateway data processing fees.',
        iconName: 'ArrowUpRight',
        x: 25,
        y: 15
      },
      {
        id: 'node-ec2-3t',
        name: 'EC2 Auto Scaling Group',
        service: 'EC2 App Fleet (Private Subnet)',
        category: 'Compute Tier',
        role: 'Stateless backend application servers residing strictly inside private subnets.',
        details: 'Spans Multi-AZ; dynamically scales out on CPU or request count target tracking policies.',
        securityTip: 'Security group strictly allows inbound traffic on port 8080 ONLY from the ALB security group.',
        iconName: 'Server',
        x: 55,
        y: 50
      },
      {
        id: 'node-elasticache-3t',
        name: 'Amazon ElastiCache',
        service: 'ElastiCache Redis',
        category: 'In-Memory Cache',
        role: 'Sub-millisecond caching of frequent DB queries and session storage.',
        details: 'Cluster with automatic failover and read replicas in private database subnet.',
        securityTip: 'Require Redis AUTH tokens and transit encryption (TLS).',
        iconName: 'Zap',
        x: 75,
        y: 20
      },
      {
        id: 'node-rds-3t',
        name: 'Amazon Aurora / RDS Multi-AZ',
        service: 'RDS PostgreSQL Multi-AZ',
        category: 'Database Tier',
        role: 'Isolated relational database with synchronous standby replica in a second AZ.',
        details: 'Automatic failover in under 60 seconds with zero data loss (RPO = 0).',
        securityTip: 'Database subnet group has ZERO internet gateway routes; only accessible from EC2 SG on port 5432.',
        iconName: 'Database',
        x: 85,
        y: 65
      }
    ],
    connections: [
      { from: 'node-r53-3t', to: 'node-alb-3t', label: 'Route HTTPS (443)' },
      { from: 'node-alb-3t', to: 'node-ec2-3t', label: 'Forward to Target Group' },
      { from: 'node-ec2-3t', to: 'node-nat-3t', label: 'Outbound Updates' },
      { from: 'node-ec2-3t', to: 'node-elasticache-3t', label: 'Read/Write Cache' },
      { from: 'node-ec2-3t', to: 'node-rds-3t', label: 'ACID SQL Queries (5432)' }
    ]
  },
  {
    id: 'event-driven-fanout',
    title: 'Event-Driven Async Processing (Fan-Out Pattern)',
    category: 'Microservices & Queues',
    difficulty: 'Intermediate',
    description: 'Decoupled asynchronous architecture for processing e-commerce checkout events, video encoding, and notification pipelines reliably without drops.',
    wellArchitectedPillar: 'Operational Excellence & Reliability',
    costEstimator: 'Extremely cost-effective: billed purely per message ($0.40 per 1M SQS requests, $0.50 per 1M SNS).',
    dataFlowSteps: [
      '1. Order service publishes an "OrderCompleted" event to Amazon SNS Topic.',
      '2. SNS broadcasts the message in parallel to multiple subscriber queues (Fan-Out).',
      '3. Queue A (Payment Service SQS) holds tasks for receipt generation Lambda.',
      '4. Queue B (Inventory Service SQS) holds tasks for warehouse dispatch Lambda.',
      '5. Queue C (Analytics Service SQS) feeds messages into Amazon Kinesis / S3 Data Lake.',
      '6. If a worker fails 3 times, message routes safely to a Dead-Letter Queue (DLQ) for inspection.'
    ],
    keyServices: ['Amazon SNS', 'Amazon SQS', 'AWS Lambda', 'Amazon EventBridge', 'Amazon S3'],
    nodes: [
      {
        id: 'node-sns-ev',
        name: 'Amazon SNS Topic',
        service: 'SNS Order Topic',
        category: 'Pub/Sub Messaging',
        role: 'Broadcasts order event once to multiple downstream subscribers.',
        details: 'Supports message attribute filtering so queues only receive events matching their criteria.',
        securityTip: 'Use KMS customer managed keys (CMK) for encryption at rest.',
        iconName: 'Bell',
        x: 15,
        y: 50
      },
      {
        id: 'node-sqs-a',
        name: 'Payment Queue',
        service: 'SQS (Receipts)',
        category: 'Buffering Queue',
        role: 'Buffers messages for payment invoice generation.',
        details: 'Configured with 4-day retention and Dead-Letter Queue attached.',
        securityTip: 'Set restrictive SQS Access Policy allowing only the specific SNS topic to publish.',
        iconName: 'ListOrdered',
        x: 48,
        y: 20
      },
      {
        id: 'node-sqs-b',
        name: 'Inventory Queue',
        service: 'SQS (Shipping)',
        category: 'Buffering Queue',
        role: 'Buffers tasks for warehouse fulfillment.',
        details: 'Protects ERP systems from sudden traffic spikes.',
        securityTip: 'Configure visibility timeout to 6x the Lambda function timeout.',
        iconName: 'ListOrdered',
        x: 48,
        y: 50
      },
      {
        id: 'node-sqs-c',
        name: 'Email Queue',
        service: 'SQS (Notification)',
        category: 'Buffering Queue',
        role: 'Buffers automated customer notifications and SMS.',
        details: 'Batches messages up to 10 items per batch to reduce Lambda invocations.',
        securityTip: 'Use Dead-Letter Queue with CloudWatch Alarm to catch delivery failures.',
        iconName: 'ListOrdered',
        x: 48,
        y: 80
      },
      {
        id: 'node-lambda-a',
        name: 'Invoice Worker',
        service: 'Lambda (Billing)',
        category: 'Worker Compute',
        role: 'Generates PDF invoice and uploads to S3.',
        details: 'Runs on ARM64 Graviton architecture for 20% lower cost.',
        securityTip: 'IAM role limited to S3:PutObject on the invoices bucket.',
        iconName: 'Zap',
        x: 82,
        y: 20
      },
      {
        id: 'node-lambda-b',
        name: 'Inventory Worker',
        service: 'Lambda (Fulfillment)',
        category: 'Worker Compute',
        role: 'Decrements warehouse inventory counts in database.',
        details: 'Executes idempotent updates to prevent duplicate fulfillment.',
        securityTip: 'Use DynamoDB conditional writes for optimistic locking.',
        iconName: 'Zap',
        x: 82,
        y: 50
      },
      {
        id: 'node-lambda-c',
        name: 'Notification Worker',
        service: 'Lambda (Email / SMS)',
        category: 'Worker Compute',
        role: 'Sends order confirmation via Amazon SES or SNS SMS.',
        details: 'Dispatches emails asynchronously.',
        securityTip: 'Verify SES domain identity with DKIM and SPF records.',
        iconName: 'Zap',
        x: 82,
        y: 80
      }
    ],
    connections: [
      { from: 'node-sns-ev', to: 'node-sqs-a', label: 'Fan-Out Event' },
      { from: 'node-sns-ev', to: 'node-sqs-b', label: 'Fan-Out Event' },
      { from: 'node-sns-ev', to: 'node-sqs-c', label: 'Fan-Out Event' },
      { from: 'node-sqs-a', to: 'node-lambda-a', label: 'Poll & Process Batch' },
      { from: 'node-sqs-b', to: 'node-lambda-b', label: 'Poll & Process Batch' },
      { from: 'node-sqs-c', to: 'node-lambda-c', label: 'Poll & Process Batch' }
    ]
  }
];
