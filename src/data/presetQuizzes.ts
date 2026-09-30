import { QuizQuestion } from '../types';

export const CLOUD_PRACTITIONER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'clf-1',
    question: 'Which AWS service is designed to help users establish a dedicated, private network connection from their on-premise data center directly into AWS without traversing the public internet?',
    scenario: 'A healthcare institution requires high-bandwidth, consistent network performance and strict compliance, prohibiting clinical patient data from traveling over the public internet.',
    options: [
      'AWS Direct Connect',
      'Amazon Route 53',
      'AWS Site-to-Site VPN',
      'Amazon CloudFront'
    ],
    correctIndex: 0,
    explanation: 'AWS Direct Connect links your internal network to an AWS Direct Connect location over a standard Ethernet fiber-optic cable, bypassing the public internet for reduced network costs, increased bandwidth throughput, and a more consistent network experience.',
    examTip: 'Keywords: "Dedicated physical connection", "bypasses public internet", "consistent throughput" = AWS Direct Connect. (Note: Site-to-Site VPN uses encrypted tunnels OVER the public internet).',
    service: 'AWS Direct Connect'
  },
  {
    id: 'clf-2',
    question: 'Under the AWS Shared Responsibility Model, which security task is the customer responsible for when utilizing Amazon EC2 instances?',
    scenario: 'A company runs their core accounting backend on an Ubuntu EC2 instance.',
    options: [
      'Applying operating system security patches and configuring the guest OS firewall',
      'Maintaining physical server security in AWS data centers',
      'Updating the physical hypervisor firmware on the host machine',
      'Disposing of decommissioned magnetic storage drives'
    ],
    correctIndex: 0,
    explanation: 'With Infrastructure as a Service (IaaS) like Amazon EC2, the customer is responsible for everything from the operating system up: installing OS security patches, configuring antivirus, managing user accounts, and defining Security Group rules.',
    examTip: 'Remember: AWS handles security OF the cloud (physical hardware, hypervisor, facilities). The customer handles security IN the cloud (OS patches, data encryption, IAM, firewall rules).',
    service: 'Shared Responsibility Model'
  },
  {
    id: 'clf-3',
    question: 'A company needs to store unstructured medical images that must be retained for 7 years for compliance. Retrieval requests occur less than once a year, and a retrieval delay of 3 to 5 hours is acceptable. Which storage class offers the lowest cost?',
    scenario: 'Archival compliance storage with rare retrieval and flexible retrieval lead time.',
    options: [
      'Amazon S3 Standard',
      'Amazon S3 Standard-Infrequent Access (S3 Standard-IA)',
      'Amazon S3 Glacier Flexible Retrieval',
      'Amazon S3 Glacier Deep Archive'
    ],
    correctIndex: 3,
    explanation: 'Amazon S3 Glacier Deep Archive is the lowest-cost storage class across all of AWS (under $1 per TB per month). It is specifically engineered for long-term data retention accessed once or twice a year with a standard retrieval time of 12 hours (or 3-5 hours on Flexible Retrieval).',
    examTip: 'Whenever you see "lowest cost storage in AWS" and "accessed once or twice a year / compliance archive", choose S3 Glacier Deep Archive.',
    service: 'Amazon S3'
  },
  {
    id: 'clf-4',
    question: 'Which AWS tool provides personalized recommendations across Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits?',
    scenario: 'A startup CTO wants an automated audit to discover unattached EBS volumes, open security group ports, and idle resources.',
    options: [
      'AWS Trusted Advisor',
      'AWS Inspector',
      'AWS Shield',
      'AWS Artifact'
    ],
    correctIndex: 0,
    explanation: 'AWS Trusted Advisor inspects your AWS environment and provides real-time recommendations across 5 categories: Cost Optimization, Security, Fault Tolerance, Performance, and Service Quotas.',
    examTip: 'AWS Trusted Advisor = best practice recommendations across 5 pillars. AWS Inspector = automated vulnerability scanner for EC2 and container images. AWS Artifact = download AWS compliance audit reports (SOC, PCI, ISO).',
    service: 'AWS Trusted Advisor'
  },
  {
    id: 'clf-5',
    question: 'Which AWS pricing model allows customers to bid on unused EC2 capacity with discounts up to 90% off On-Demand prices, with the trade-off that instances can be interrupted?',
    scenario: 'A university research lab needs to run massive mathematical batch simulations that can be checkpointed and resumed if interrupted.',
    options: [
      'Dedicated Hosts',
      'Spot Instances',
      'Reserved Instances',
      'On-Demand Instances'
    ],
    correctIndex: 1,
    explanation: 'Spot Instances allow you to request spare Amazon EC2 computing capacity for up to 90% off the On-Demand price. The trade-off is that AWS can reclaim the instance with a 2-minute warning when it needs the capacity back.',
    examTip: 'Spot Instances are ideal for fault-tolerant, stateless, or batch processing jobs. Never use Spot for critical databases or stateful applications.',
    service: 'Amazon EC2'
  }
];

export const SOLUTIONS_ARCHITECT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'saa-1',
    question: 'A company has a multi-tier web application. The web tier is behind an Application Load Balancer. The database tier uses Amazon RDS for MySQL. The database is experiencing high CPU utilization due to a high volume of read queries for identical product catalog pages. What is the most cost-effective and performant architecture change?',
    scenario: 'E-commerce flash sale causing read bottlenecks on relational database.',
    options: [
      'Deploy Amazon ElastiCache for Redis in front of the database to cache product catalog read queries',
      'Migrate the database to Amazon Redshift cluster',
      'Upgrade the RDS instance to a db.m5.24xlarge instance type',
      'Create an Amazon SQS FIFO queue in front of RDS'
    ],
    correctIndex: 0,
    explanation: 'Amazon ElastiCache for Redis is an in-memory caching engine that provides sub-millisecond response times for frequent read queries. Caching identical catalog requests offloads the read burden from RDS, drastically lowering RDS CPU without requiring expensive vertical scaling.',
    examTip: 'High read volume on RDS with repetitive reads? Solution: Amazon ElastiCache (Redis or Memcached) or RDS Read Replicas. If sub-millisecond latency is mentioned, ElastiCache is the top choice.',
    service: 'Amazon ElastiCache & RDS'
  },
  {
    id: 'saa-2',
    question: 'An application processes images uploaded by users. The upload rate fluctuates between 10 images per minute and 5,000 images per minute. Processing an image takes 15 seconds. Which decoupled architecture guarantees that no images are lost during sudden traffic spikes while minimizing idle costs?',
    scenario: 'Unpredictable bursty media processing pipeline.',
    options: [
      'Users upload images to an EC2 web server, which stores them on an attached EBS volume and processes them synchronously',
      'Upload images to an Amazon S3 bucket, configure S3 Event Notifications to send an event to Amazon SQS, and have AWS Lambda functions poll the SQS queue',
      'Upload images to Amazon EFS and use an Auto Scaling group with step scaling based on NetworkIn metrics',
      'Directly invoke an AWS Lambda function from the client browser with synchronous payload'
    ],
    correctIndex: 1,
    explanation: 'Uploading directly to Amazon S3 provides virtually infinite upload bandwidth. S3 Event Notifications push events to an Amazon SQS queue, which acts as a reliable buffer that prevents any dropped tasks. AWS Lambda automatically scales up to process messages from the queue and scales down to zero when idle.',
    examTip: 'Decoupling pattern: S3 + SQS + Lambda. SQS buffers traffic surges, guarantees zero message loss, and scales compute on-demand.',
    service: 'AWS Serverless (S3 + SQS + Lambda)'
  },
  {
    id: 'saa-3',
    question: 'A solutions architect must design an architecture where EC2 instances in private subnets across multiple VPCs in the same region can access an Amazon DynamoDB table without traversing the public internet, and without paying data transfer fees through a NAT Gateway. What should be configured?',
    scenario: 'High-throughput private database communication across VPC subnets.',
    options: [
      'Create a VPC Gateway Endpoint for Amazon DynamoDB and update the route tables in each VPC',
      'Deploy an Internet Gateway in each private subnet and assign Elastic IPs to instances',
      'Set up an AWS Site-to-Site VPN between each VPC and DynamoDB',
      'Use AWS Direct Connect with a Public Virtual Interface'
    ],
    correctIndex: 0,
    explanation: 'A VPC Gateway Endpoint (available for Amazon S3 and Amazon DynamoDB) allows instances in private subnets to communicate directly with DynamoDB via AWS internal network routes. VPC Gateway Endpoints are completely free to create and incur zero data transfer charges, unlike NAT Gateways or Interface Endpoints.',
    examTip: 'VPC Gateway Endpoints are available ONLY for two services: Amazon S3 and Amazon DynamoDB! They are free and configured via route table entries.',
    service: 'Amazon VPC & DynamoDB'
  },
  {
    id: 'saa-4',
    question: 'A global mobile application requires users in North America, Europe, and Asia to query and update the same user profile database with latency under 10 milliseconds, and requires continuous availability even if an entire AWS region experiences an outage. Which database setup satisfies this requirement?',
    scenario: 'Global multi-region active-active database with automatic disaster recovery.',
    options: [
      'Amazon RDS PostgreSQL with cross-region read replicas',
      'Amazon DynamoDB Global Tables with multi-region active-active replication',
      'Amazon Aurora with cross-region snapshot replication',
      'Amazon DocumentDB with manual failover scripts'
    ],
    correctIndex: 1,
    explanation: 'Amazon DynamoDB Global Tables provide fully managed, multi-region, active-active data replication. Writes in any participating AWS region are replicated across all other regions within seconds, enabling local single-digit millisecond read/write latency worldwide and seamless multi-region disaster recovery.',
    examTip: 'Keywords: "Multi-region active-active", "write to any region", "global low-latency" = DynamoDB Global Tables.',
    service: 'Amazon DynamoDB Global Tables'
  }
];
