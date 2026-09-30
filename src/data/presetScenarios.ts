import { ScenarioChallenge } from '../types';

export const PRESET_SCENARIOS: ScenarioChallenge[] = [
  {
    id: 'scenario-nat-bill',
    title: 'The Mystery $4,200 Surprise AWS Bill',
    context: 'A video processing startup noticed their monthly AWS bill abruptly surged from $350 to $4,550. Checking AWS Cost Explorer revealed 90% of the cost is categorized under "VPC: NAT Gateway Data Transfer - Bytes".',
    symptoms: [
      'Huge recurring charges under "VPC NAT Gateway Data Processing" ($0.045 per GB)',
      'Worker EC2 instances in private subnets are downloading hundreds of Gigabytes of video raw material from an S3 bucket in the same region',
      'Zero external web traffic increases'
    ],
    architecture: 'Compute fleet in private subnets accessing regional Amazon S3 bucket via standard default route to the NAT Gateway.',
    options: [
      {
        id: 'A',
        title: 'Move all worker EC2 instances to a Public Subnet with Public IPs',
        explanation: 'While this technically bypasses the NAT Gateway, placing core processing instances in a public subnet exposes them directly to internet port scans and violates defense-in-depth isolation.',
        isBestSolution: false,
        tradeOffs: 'Severe security compromise; still routes traffic across public network interfaces.'
      },
      {
        id: 'B',
        title: 'Create a free VPC Gateway Endpoint for Amazon S3',
        explanation: 'VPC Gateway Endpoints for Amazon S3 establish a private, direct route from your private subnet route tables directly to S3 over the AWS internal network. It takes 2 minutes to create and incurs exactly $0.00 data transfer fees!',
        isBestSolution: true,
        tradeOffs: 'Zero cost; zero downtime; instantaneous fix that drops the NAT Gateway bill to $0.'
      },
      {
        id: 'C',
        title: 'Upgrade the NAT Gateway to a larger instance class',
        explanation: 'NAT Gateways are AWS-managed resources that auto-scale bandwidth up to 100 Gbps. They do not have configurable instance sizes, and the bill is driven by data volume transferred.',
        isBestSolution: false,
        tradeOffs: 'Technically invalid; does not solve the root issue.'
      },
      {
        id: 'D',
        title: 'Route the S3 traffic through AWS Transit Gateway',
        explanation: 'Transit Gateway also charges per gigabyte of processed data and would actually increase the bill further.',
        isBestSolution: false,
        tradeOffs: 'More expensive and adds routing complexity.'
      }
    ],
    wellArchitectedPillar: 'Cost Optimization & Performance Efficiency',
    takeaway: 'Always provision VPC Gateway Endpoints for S3 and DynamoDB inside private subnets to avoid heavy NAT Gateway per-GB data processing fees.'
  },
  {
    id: 'scenario-504-timeout',
    title: 'The Black Friday 504 Gateway Timeout Outage',
    context: 'During an e-commerce flash sale, customer traffic surged 20x. The Application Load Balancer started returning HTTP 504 (Gateway Timeout) errors to customers, and the site crashed.',
    symptoms: [
      'Application Load Balancer returning HTTP 504 (Target Timeout)',
      'EC2 CPU utilization was only at 40%, but the backend relational RDS PostgreSQL database CPU hit 100%',
      'Hundreds of concurrent database connections were waiting on locked rows'
    ],
    architecture: 'Single RDS PostgreSQL db.t3.medium instance directly receiving all read and write queries from 20 EC2 app servers.',
    options: [
      {
        id: 'A',
        title: 'Increase the Application Load Balancer idle timeout from 60s to 300s',
        explanation: 'Increasing the ALB timeout just forces customers to wait 5 minutes before seeing an error. It keeps database connections held open even longer, worsening database connection pool exhaustion.',
        isBestSolution: false,
        tradeOffs: 'Does not fix database bottleneck; degrades user experience.'
      },
      {
        id: 'B',
        title: 'Add Amazon ElastiCache (Redis) for catalog reads & implement RDS Read Replicas',
        explanation: 'Flash sales are predominantly read-heavy (95% browsing products, 5% checking out). Caching product pages in ElastiCache Redis eliminates 90% of database queries. Adding RDS Read Replicas offloads remaining reads, freeing the primary RDS instance for write transactions.',
        isBestSolution: true,
        tradeOffs: 'Requires slight caching logic in code; provides massive scaling and sub-millisecond response.'
      },
      {
        id: 'C',
        title: 'Convert the EC2 instances to AWS Lambda immediately',
        explanation: 'Switching to Lambda without fixing the database bottleneck will actually make the outage worse, as thousands of concurrent Lambda functions will instantly exhaust the RDS PostgreSQL connection limit.',
        isBestSolution: false,
        tradeOffs: 'Severe database connection pool exhaustion.'
      },
      {
        id: 'D',
        title: 'Disable SSL termination on the Load Balancer',
        explanation: 'SSL termination on ALB has zero relation to backend database query exhaustion.',
        isBestSolution: false,
        tradeOffs: 'Breaks HTTPS security; irrelevant to 504 target timeout.'
      }
    ],
    wellArchitectedPillar: 'Reliability & Performance Efficiency',
    takeaway: 'Never let relational primary databases absorb raw repetitive read traffic during surges. Use in-memory caching (ElastiCache) and Read Replicas to shield the master database.'
  }
];
