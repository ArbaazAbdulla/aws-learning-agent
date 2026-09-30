import { AWSService } from '../types';

export const AWS_SERVICES_DATA: AWSService[] = [
  {
    id: 'ec2',
    name: 'Amazon Elastic Compute Cloud',
    code: 'Amazon EC2',
    category: 'Compute',
    tagline: 'Virtual servers in the cloud with resizable capacity',
    analogy: 'Renting a personal computer or apartment in a skyscraper where you choose the CPU, RAM, and OS, and only pay for the exact hours or seconds it stays powered on.',
    description: 'Amazon EC2 provides scalable computing capacity in the AWS Cloud. It eliminates your need to invest in hardware upfront, so you can develop and deploy applications faster. You can launch virtual servers, configure security and networking, and manage storage.',
    freeTier: '750 hours per month of t2.micro or t3.micro instances for 12 months.',
    keyFeatures: [
      'Multiple purchasing options (On-Demand, Spot, Reserved, Savings Plans)',
      'Security Groups acting as virtual stateful firewalls',
      'Elastic Block Store (EBS) persistent virtual drives',
      'Auto Scaling Groups to dynamically handle demand surges'
    ],
    commonUseCases: [
      'Hosting monolithic web applications',
      'Running background batch computing and ML rendering',
      'Legacy applications requiring custom OS kernels or software packages'
    ],
    cliExample: 'aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t2.micro --key-name MyKeyPair --security-group-ids sg-903004f8',
    examTip: 'Spot instances save up to 90% but can be terminated with a 2-minute notice. Never use Spot for stateful, non-interruptible workloads. Reserved Instances require a 1 or 3-year commitment for up to 72% discounts.',
    color: 'from-amber-500 to-orange-600',
    iconName: 'Server'
  },
  {
    id: 's3',
    name: 'Amazon Simple Storage Service',
    code: 'Amazon S3',
    category: 'Storage',
    tagline: 'Infinite object storage built to store and retrieve any amount of data',
    analogy: 'An infinite digital storage locker facility. You drop files in a locker (Bucket), put a label on each file (Object Key), and AWS guarantees that it will virtually never get lost (99.999999999% durability).',
    description: 'Amazon S3 is object storage built to retrieve any amount of data from anywhere. It offers industry-leading durability, availability, performance, security, and virtually unlimited scalability.',
    freeTier: '5 GB of standard storage, 20,000 GET requests, 2,000 PUT requests per month for 12 months.',
    keyFeatures: [
      '11 9s durability (99.999999999%) across multiple Availability Zones',
      'Tiered storage classes: S3 Standard, S3 Standard-IA, Glacier Instant Retrieval, Glacier Deep Archive',
      'S3 Lifecycle policies to automatically move or delete older data',
      'Static website hosting, Cross-Region Replication (CRR), and Object Lock (WORM)'
    ],
    commonUseCases: [
      'Storing static assets (images, videos, PDF documents)',
      'Data lake storage for big data analytics',
      'Backup, disaster recovery, and long-term compliance archiving',
      'Hosting serverless static frontend web apps'
    ],
    cliExample: 'aws s3 cp index.html s3://my-cloud-portfolio-bucket/ --acl private',
    examTip: 'Objects are stored in Buckets with globally unique names. S3 is Object storage (key-value), NOT block storage (cannot install an OS on it) or file system (not POSIX).',
    color: 'from-emerald-500 to-teal-600',
    iconName: 'HardDrive'
  },
  {
    id: 'iam',
    name: 'AWS Identity and Access Management',
    code: 'AWS IAM',
    category: 'Security & IAM',
    tagline: 'Securely control access to AWS services and resources',
    analogy: 'The master security department of an enterprise office building. Users get personalized photo badges (IAM Users), job teams share standard access cards (IAM Groups), and visitors or temp workers get short-term guest passes (IAM Roles).',
    description: 'AWS IAM is a foundational security service that helps you securely control access to AWS resources. You use IAM to control who is authenticated (signed in) and authorized (has permissions) to use resources.',
    freeTier: 'Completely free service; no additional charge for IAM users, roles, or policies.',
    keyFeatures: [
      'Fine-grained JSON permissions policies (Effect, Principal, Action, Resource, Condition)',
      'Multi-Factor Authentication (MFA) enforcement',
      'IAM Roles for services (e.g. giving EC2 permission to read an S3 bucket without hardcoded keys)',
      'AWS Identity Center (Single Sign-On) and temporary STS credentials'
    ],
    commonUseCases: [
      'Enforcing the Principle of Least Privilege across developer teams',
      'Granting applications running on AWS permission to talk to databases and queues',
      'Federating enterprise corporate logins (Google, Okta, Active Directory)'
    ],
    cliExample: 'aws iam create-user --user-name cloud-student-bob',
    examTip: 'Golden rule of IAM: Never create access keys for the Root account! Always attach IAM Roles to EC2 instead of storing access keys inside code or config files.',
    color: 'from-red-500 to-rose-600',
    iconName: 'ShieldCheck'
  },
  {
    id: 'lambda',
    name: 'AWS Lambda',
    code: 'AWS Lambda',
    category: 'Serverless & Integration',
    tagline: 'Run code without provisioning or managing servers',
    analogy: 'Ordering an Uber on-demand instead of owning, parking, and fueling a personal car. When a request arrives, the car magically appears, takes your code from Point A to Point B, and disappears. You pay only for the exact milliseconds your journey took.',
    description: 'AWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers. You can trigger Lambda from over 200 AWS services and SaaS applications.',
    freeTier: '1 Million free requests per month, and 3.2 million seconds of compute time per month permanently free!',
    keyFeatures: [
      'Automatic horizontal scaling from 0 to thousands of concurrent executions',
      'Pay-per-millisecond execution billing',
      'Native support for Node.js, Python, Java, Go, Ruby, .NET, and custom container images',
      'Event triggers from S3 uploads, DynamoDB streams, API Gateway requests, SQS queues, and EventBridge'
    ],
    commonUseCases: [
      'Serverless microservices and REST APIs (with API Gateway)',
      'Real-time image/video processing right when uploaded to S3',
      'Cron scheduled automation tasks (CloudWatch / EventBridge rules)',
      'Data transformation streaming pipelines'
    ],
    cliExample: 'aws lambda invoke --function-name resizeUserAvatar output.json',
    examTip: 'Lambda has a maximum execution timeout of 15 minutes! If a job runs longer than 15 minutes, use AWS ECS, AWS Batch, or AWS Step Functions orchestration.',
    color: 'from-amber-400 to-yellow-500',
    iconName: 'Zap'
  },
  {
    id: 'vpc',
    name: 'Amazon Virtual Private Cloud',
    code: 'Amazon VPC',
    category: 'Networking',
    tagline: 'Isolated virtual cloud network to launch your AWS resources',
    analogy: 'Building a private, gated residential community in the cloud. You control the outer perimeter gates (Internet Gateway), the internal neighborhood streets (Subnets), the security guards at individual house doors (Security Groups), and the neighborhood border control (NACLs).',
    description: 'Amazon VPC lets you provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. You have complete control over your virtual networking environment, including selection of your own IP address range, subnets, route tables, and network gateways.',
    freeTier: 'Creating a basic VPC, subnets, and route tables is free. Charges apply for NAT Gateways, VPC Endpoints, and VPN connections.',
    keyFeatures: [
      'CIDR IP address block customization (IPv4 / IPv6)',
      'Public Subnets (routable to Internet Gateway) vs Private Subnets (isolated backend)',
      'NAT Gateways for private outbound internet connectivity without exposing inbound ports',
      'VPC Peering, Transit Gateway, and PrivateLink VPC Endpoints'
    ],
    commonUseCases: [
      'Isolating production databases in strictly private subnets with no internet exposure',
      'Creating multi-tier resilient architectures (Web tier -> App tier -> DB tier)',
      'Connecting corporate on-premise data centers to AWS via Site-to-Site VPN or Direct Connect'
    ],
    cliExample: 'aws ec2 create-vpc --cidr-block 10.0.0.0/16',
    examTip: 'Security Groups are STATEFUL (if traffic is allowed in, the reply is automatically allowed out). NACLs (Network Access Control Lists) are STATELESS and operate at the subnet boundary with explicit allow/deny rules.',
    color: 'from-blue-500 to-cyan-600',
    iconName: 'Network'
  },
  {
    id: 'rds',
    name: 'Amazon Relational Database Service',
    code: 'Amazon RDS',
    category: 'Database',
    tagline: 'Managed relational database service for MySQL, PostgreSQL, MariaDB, and Oracle',
    analogy: 'Having a world-class dedicated database administrator on call 24/7 who automatically patches the OS, takes daily automated backups, handles hardware failovers in seconds, and tunes performance while you just write SQL queries.',
    description: 'Amazon RDS makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient, resizable capacity while automating time-consuming administration tasks such as hardware provisioning, database setup, patching, and backups.',
    freeTier: '750 hours per month of db.t3.micro or db.t4g.micro Single-AZ instances with 20 GB storage for 12 months.',
    keyFeatures: [
      'Supports PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, and Amazon Aurora',
      'Multi-AZ deployments for automated synchronous failover and Disaster Recovery',
      'Read Replicas for scaling read-heavy query workloads asynchronously',
      'Automated snapshots, point-in-time recovery, and storage auto-scaling'
    ],
    commonUseCases: [
      'E-commerce applications requiring strict ACID transactional guarantees',
      'Enterprise ERP and CRM applications',
      'Relational data models with complex joins and constraints'
    ],
    cliExample: 'aws rds create-db-instance --db-instance-identifier mydb --db-instance-class db.t3.micro --engine postgres --master-username postgres --allocated-storage 20',
    examTip: 'Multi-AZ is for HIGH AVAILABILITY and disaster recovery (synchronous replication; failover occurs automatically). Read Replicas are for SCALABILITY and read performance (asynchronous replication; can be promoted to standalone DB).',
    color: 'from-blue-600 to-indigo-700',
    iconName: 'Database'
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    code: 'Amazon DynamoDB',
    category: 'Database',
    tagline: 'Fast, flexible NoSQL database service for single-digit millisecond latency at any scale',
    analogy: 'A hyper-optimized warehouse filing system where every single document has a precise barcode. No matter whether you have 100 documents or 100 billion documents, the robot grabs your file in exactly 5 milliseconds.',
    description: 'Amazon DynamoDB is a fully managed, serverless, key-value and document database designed for high-performance applications at any scale. It offers built-in security, continuous backups, automated multi-region replication, in-memory caching with DAX, and data export tools.',
    freeTier: '25 GB of storage, 25 provisioned Write Capacity Units (WCU), and 25 Read Capacity Units (RCU) permanently free!',
    keyFeatures: [
      'Consistent single-digit millisecond response times at extreme scale',
      'On-Demand capacity mode (pay per request) or Provisioned capacity mode',
      'Global Tables for multi-region active-active real-time synchronization',
      'DynamoDB Streams for real-time change data capture triggering Lambda'
    ],
    commonUseCases: [
      'Real-time user session stores and shopping carts',
      'Mobile gaming state and player leaderboards',
      'IoT device telemetry and event tracking'
    ],
    cliExample: 'aws dynamodb put-item --table-name Users --item \'{"UserId": {"S": "u123"}, "Name": {"S": "Alex"}}\'',
    examTip: 'DynamoDB uses Partition Keys (HASH) and optional Sort Keys (RANGE). For microsecond latency caching on read-heavy workloads, use DynamoDB Accelerator (DAX).',
    color: 'from-sky-500 to-blue-600',
    iconName: 'Layers'
  },
  {
    id: 'cloudfront',
    name: 'Amazon CloudFront',
    code: 'Amazon CloudFront',
    category: 'Networking',
    tagline: 'Fast, highly secure, and programmable Content Delivery Network (CDN)',
    analogy: 'A global franchise of satellite convenience stores. Instead of shipping every single cup of coffee from a central warehouse in Virginia to a customer in Tokyo, the Tokyo corner store keeps the coffee cached on its local shelf for instant delivery.',
    description: 'Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds, using a worldwide network of over 600 Edge Locations.',
    freeTier: '1 TB of data transfer out per month, 10,000,000 HTTP/HTTPS requests per month permanently free!',
    keyFeatures: [
      'Global Edge Locations cache static and dynamic web content closer to users',
      'Seamless integration with AWS Shield Standard for automatic DDoS protection',
      'SSL/TLS encryption termination with free AWS Certificate Manager (ACM) certificates',
      'Origin Access Control (OAC) to secure S3 buckets so users can only access files via CloudFront'
    ],
    commonUseCases: [
      'Accelerating website loading speeds worldwide',
      'Delivering video streaming (HLS, DASH)',
      'Protecting origin web servers and APIs from volumetric traffic surges and DDoS attacks'
    ],
    cliExample: 'aws cloudfront create-invalidation --distribution-id E12345 --paths "/*"',
    examTip: 'To secure an S3 static site so users cannot bypass CloudFront and download files directly from S3, use Origin Access Control (OAC).',
    color: 'from-purple-500 to-indigo-600',
    iconName: 'Globe'
  },
  {
    id: 'route53',
    name: 'Amazon Route 53',
    code: 'Amazon Route 53',
    category: 'Networking',
    tagline: 'Highly available and scalable cloud Domain Name System (DNS) web service',
    analogy: 'The global phonebook and air traffic controller of the internet. It translates human-friendly website names like "google.com" into computer IP addresses like "142.250.190.46", and routes users to the closest or healthiest server.',
    description: 'Amazon Route 53 effectively connects user requests to infrastructure running in AWS—such as Amazon EC2 instances, Elastic Load Balancing load balancers, or Amazon S3 buckets—and can also be used to route users to infrastructure outside of AWS.',
    freeTier: 'Hosted zones cost $0.50/month each (not in free tier, but very low cost).',
    keyFeatures: [
      '100% SLA availability guarantee',
      'Smart routing policies: Latency-based, Geolocation, Geoproximity, Weighted, and Failover',
      'Health checks with automated DNS failover to backup servers',
      'Alias Records for direct mapping to AWS resources (CloudFront, ALB, S3) with zero DNS lookup charges'
    ],
    commonUseCases: [
      'Registering domain names and managing DNS records',
      'Disaster recovery active-passive website failover',
      'Routing international visitors to regional web servers'
    ],
    cliExample: 'aws route53 list-hosted-zones',
    examTip: 'Route 53 Alias records are AWS-proprietary extensions to DNS. Unlike standard CNAME records, Alias records can point directly to the Zone Apex (the root domain like example.com) and are free of query costs.',
    color: 'from-amber-600 to-red-600',
    iconName: 'Compass'
  },
  {
    id: 'sqs',
    name: 'Amazon Simple Queue Service',
    code: 'Amazon SQS',
    category: 'Serverless & Integration',
    tagline: 'Fully managed message queuing service for decoupling microservices',
    analogy: 'A restaurant order ticket wheel. Waiters place customer food slips on the wheel. Chefs grab tickets one by one when they have capacity. Even if 100 customers order at the same moment, the kitchen never crashes because tickets sit patiently in line.',
    description: 'Amazon SQS is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications. SQS eliminates the complexity and overhead associated with managing message-oriented middleware.',
    freeTier: '1 Million requests per month permanently free!',
    keyFeatures: [
      'Standard Queues (nearly unlimited throughput, best-effort ordering, at-least-once delivery)',
      'FIFO Queues (First-In-First-Out, guaranteed exact ordering, exactly-once processing)',
      'Dead-Letter Queues (DLQ) for capturing unprocessable or failing messages',
      'Visibility timeout ensuring only one worker processes a message at a time'
    ],
    commonUseCases: [
      'Decoupling web frontends from heavy background processing jobs',
      'Buffering spikes in orders, analytics, or batch uploads',
      'Fan-out architecture combined with Amazon SNS'
    ],
    cliExample: 'aws sqs send-message --queue-url https://sqs.us-east-1.amazonaws.com/123/OrderQueue --message-body "Order #992"',
    examTip: 'Standard queues provide "at-least-once delivery" and messages may arrive out of order. FIFO queues guarantee "strictly once delivery" and exact chronological ordering, but have lower maximum throughput.',
    color: 'from-pink-500 to-rose-600',
    iconName: 'ListOrdered'
  },
  {
    id: 'sns',
    name: 'Amazon Simple Notification Service',
    code: 'Amazon SNS',
    category: 'Serverless & Integration',
    tagline: 'High-throughput push-based publish/subscribe (pub/sub) messaging',
    analogy: 'A newspaper publisher or emergency broadcast speaker. When breaking news occurs, the publisher broadcasts the message once, and it instantly pushes out to thousands of subscribers (SMS, email, push notifications, or SQS queues).',
    description: 'Amazon SNS is a fully managed pub/sub messaging service that enables message exchange between decoupled systems or from applications directly to people (via SMS, mobile push, and email).',
    freeTier: '1 Million mobile push notifications and 100,000 SMS messages permanently free (regional limits apply).',
    keyFeatures: [
      'Publish/Subscribe 1-to-many fan-out architecture',
      'Direct push to Amazon SQS, AWS Lambda, HTTP/HTTPS webhooks, email, and SMS',
      'Message filtering policies so subscribers only receive relevant messages',
      'End-to-end encryption with AWS KMS'
    ],
    commonUseCases: [
      'Fan-out design: publishing an "OrderPlaced" event to multiple backend services simultaneously',
      'Critical system alarms and devops alerts (CloudWatch Alarms -> SNS -> Email/Slack)',
      'Sending One-Time-Passwords (OTP) or mobile push notifications'
    ],
    cliExample: 'aws sns publish --topic-arn arn:aws:sns:us-east-1:123:Alerts --message "Server CPU High!"',
    examTip: 'SNS is PUSH-based (it pushes messages immediately to subscribers). SQS is PULL-based (workers poll and pull messages off the queue). Combining SNS + multiple SQS queues creates the classic "Fan-Out" architecture.',
    color: 'from-orange-500 to-amber-600',
    iconName: 'Bell'
  },
  {
    id: 'cloudwatch',
    name: 'Amazon CloudWatch',
    code: 'Amazon CloudWatch',
    category: 'Monitoring & Management',
    tagline: 'Observability of AWS resources and applications in real time',
    analogy: 'The digital dashboard, speedometer, engine warning lights, and black box recorder of your cloud car. It monitors RPM (CPU), fuel usage (memory), logs trips, and sounds a siren (Alarm) if the engine gets dangerously hot.',
    description: 'Amazon CloudWatch provides data and actionable insights to monitor your applications, respond to system-wide performance changes, and optimize resource utilization. It collects monitoring and operational data in the form of logs, metrics, and events.',
    freeTier: '10 custom metrics, 10 alarms, 5 GB log data ingestion per month permanently free.',
    keyFeatures: [
      'Real-time metrics dashboards (CPU utilization, network I/O, disk operations)',
      'CloudWatch Alarms that can trigger Auto Scaling actions or SNS notifications',
      'CloudWatch Logs for centralized application and system log aggregation and querying',
      'CloudWatch Container Insights and Lambda Insights'
    ],
    commonUseCases: [
      'Triggering EC2 Auto Scaling when CPU exceeds 75% for 5 minutes',
      'Searching application stack traces across distributed server fleets',
      'Setting up billing budget alarms to prevent accidental spend'
    ],
    cliExample: 'aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-12345 --start-time 2026-09-30T00:00:00 --end-time 2026-09-30T01:00:00 --period 300 --statistics Average',
    examTip: 'CloudWatch monitors performance (Metrics, Logs, Alarms). CloudTrail monitors GOVERNANCE and API calls (WHO made WHAT change WHEN). Don\'t confuse the two on the exam!',
    color: 'from-teal-500 to-emerald-600',
    iconName: 'Activity'
  }
];
