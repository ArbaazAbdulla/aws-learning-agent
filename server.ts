import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI with recommended telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// System instruction for the AWS Learning Agent
const AWS_TUTOR_SYSTEM_INSTRUCTION = `You are "The AWS Learning Agent", an expert AWS Solutions Architect, Cloud Instructor, and mentor.
Your mission is to make Amazon Web Services (AWS) concepts simple, engaging, intuitive, and practical for learners of all levels—especially beginners, university students, and engineers studying for certifications (AWS Certified Cloud Practitioner CLF-C02 and AWS Certified Solutions Architect Associate SAA-C03).

When explaining concepts:
1. Always start with a crystal-clear, intuitive explanation or "Real-World Analogy" (e.g. S3 = an infinite digital storage locker, EC2 = renting a virtual PC in Amazon's data center, IAM = security keycards and role badges, VPC = your own gated private neighborhood with security guards).
2. Detail how the service works under the hood in simple terms.
3. Provide a practical architecture context (how it connects to other services like S3 + CloudFront, or EC2 + ALB + RDS).
4. When relevant, provide practical AWS CLI or SDK code snippets (with clear comments).
5. Highlight "Gotchas & Cost Traps" (e.g., NAT Gateway hourly fee, S3 public access settings, DynamoDB hot partition keys).
6. Provide an "Exam Pro-Tip" for AWS certifications.
7. Keep tone supportive, encouraging, and structured with clear Markdown headers, bold highlights, and bullet points.`;

// Helper function to call Gemini with retry and fallback model
async function generateGeminiText(promptText: string, systemInstruction: string, jsonMode = false, responseSchema?: any) {
  if (!ai) return null;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const model of modelsToTry) {
    try {
      const config: any = {
        systemInstruction,
        temperature: 0.7,
      };

      if (jsonMode) {
        config.responseMimeType = 'application/json';
        if (responseSchema) {
          config.responseSchema = responseSchema;
        }
      }

      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err.message || err);
      // Continue to next model if 503, 429, or unavailable
    }
  }

  return null;
}

// Curated fallback generator for AWS concepts
function getCuratedTutorReply(query: string, mode?: string): string {
  const q = query.toLowerCase();

  if (q.includes('iam') || q.includes('role') || q.includes('policy')) {
    return `### 🛡️ AWS IAM (Identity & Access Management) Deep Dive

**💡 The Real-World Analogy:**
Think of IAM like the security system of a high-tech corporate office building:
- **IAM User:** A permanent employee with a personalized photo ID badge (credentials).
- **IAM Group:** A department (e.g., "Accounting" or "DevOps") sharing the same floor keycards.
- **IAM Role:** A temporary visitor pass or security lanyard. Anyone who wears it temporarily gets those exact permissions (e.g. an EC2 instance assuming an S3-reading role).
- **IAM Policy:** The official laminated rulebook saying: *"Badge holders can enter Room 402 between 9am-5pm to read files, but cannot delete anything."*

**📐 Core Rule: Principle of Least Privilege**
Only grant the minimum permissions required to perform the task. Never give \`AdministratorAccess\` or \`*\` wildcards to production services.

**⚠️ Common Gotcha:**
Never create access keys for the **Root user**! Lock away the root email and password with hardware/virtual MFA, and use IAM Roles for applications running on EC2 or Lambda.

**🎯 Exam Pro-Tip (CLF-C02 & SAA-C03):**
IAM Policies are written in JSON with 5 core elements:
1. **Effect**: \`Allow\` or \`Deny\` (Explicit Deny always overrides Allow!)
2. **Principal**: Who is requesting access (User, Role, Service)
3. **Action**: API call (e.g., \`s3:GetObject\`, \`ec2:RunInstances\`)
4. **Resource**: The ARN of the resource (e.g. \`arn:aws:s3:::my-bucket/*\`)
5. **Condition**: Optional constraints (e.g. IP address or MFA requirement).`;
  }

  if (q.includes('s3') || q.includes('storage') || q.includes('bucket')) {
    return `### 🪣 Amazon S3 (Simple Storage Service) Deep Dive

**💡 The Real-World Analogy:**
Think of Amazon S3 as an infinite digital storage locker facility. You create a locker called a **Bucket**, give it a globally unique name, drop in files (**Objects**), and AWS guarantees that it will virtually never get lost (**99.999999999% / 11 9's durability**).

**📊 S3 Storage Classes:**
1. **S3 Standard:** For active, frequently accessed data (websites, mobile assets).
2. **S3 Intelligent-Tiering:** Automatically moves data between tiers based on changing access patterns with no retrieval fees.
3. **S3 Standard-IA (Infrequent Access):** Lower storage cost, but charges a per-GB retrieval fee. Rapid access.
4. **S3 Glacier Flexible Retrieval:** Archival storage; retrieval takes minutes to hours.
5. **S3 Glacier Deep Archive:** Lowest cost across all AWS (under $1/TB/month); 12-hour retrieval window.

**💻 Hands-on AWS CLI:**
\`\`\`bash
# Create a secure private bucket
aws s3 mb s3://my-cloud-study-bucket-2026

# Upload a file with server-side KMS encryption
aws s3 cp document.pdf s3://my-cloud-study-bucket-2026/ --sse aws:kms
\`\`\`

**🎯 Exam Pro-Tip:**
By default, newly created S3 buckets have **Block Public Access enabled**. To serve static sites globally with HTTPS, keep the bucket private and pair it with **Amazon CloudFront** using **Origin Access Control (OAC)**.`;
  }

  if (q.includes('ec2') || q.includes('compute') || q.includes('server')) {
    return `### 🖥️ Amazon EC2 (Elastic Compute Cloud) Deep Dive

**💡 The Real-World Analogy:**
EC2 is like renting a virtual PC in Amazon's massive warehouse data center. You pick the CPU power, RAM size, OS (Linux, Windows, Ubuntu), and disk size (EBS), and you can turn it on or shut it off whenever you want.

**🏷️ Purchasing Models (Massive Exam Topic):**
1. **On-Demand:** Pay by the second with zero commitments. Best for unpredictable spikes.
2. **Reserved Instances / Savings Plans:** 1 or 3-year commitment for up to 72% discounts. Best for steady-state workloads.
3. **Spot Instances:** Bid on spare AWS capacity for up to 90% discount. AWS can reclaim it with a 2-minute notice! Best for fault-tolerant batch processing.
4. **Dedicated Hosts:** Physical server fully dedicated to you for compliance/licensing.

**🎯 Exam Pro-Tip:**
Security Groups are **STATEFUL** virtual firewalls (inbound traffic automatically allows response out). Never open SSH port 22 to \`0.0.0.0/0\` in production!`;
  }

  if (q.includes('vpc') || q.includes('subnet') || q.includes('nat') || q.includes('network')) {
    return `### 🌐 Amazon VPC (Virtual Private Cloud) Deep Dive

**💡 The Real-World Analogy:**
Amazon VPC is your own private, gated neighborhood inside the AWS cloud:
- **Internet Gateway (IGW):** The main gated highway entrance connecting your neighborhood to the world.
- **Public Subnet:** Houses on the main commercial boulevard with direct street access to the Internet Gateway.
- **Private Subnet:** Houses deep inside a quiet cul-de-sac with no direct road to the outside.
- **NAT Gateway:** A secure mail delivery shuttle parked in the public subnet. Private houses send letters out through the shuttle, but outside strangers cannot enter.

**📐 Network Flow:**
\`\`\`text
Internet ---> [Internet Gateway] ---> [Public Subnet (ALB / Bastion)]
                                             |
                                   [Private Subnet (EC2 / RDS)]
                                             | (outbound only)
                                   [NAT Gateway (in Public Subnet)] ---> External APIs
\`\`\`

**🎯 Exam Pro-Tip:**
A **NAT Gateway** must always be placed in a **PUBLIC subnet** with an Elastic IP! Security Groups operate at the instance level (stateful), while Network Access Control Lists (NACLs) operate at the subnet level (stateless).`;
  }

  return `### ☁️ AWS Cloud Architecture Insights: ${query}

**💡 The Cloud Mindset:**
In AWS, modern architectures follow the **AWS Well-Architected Framework**:
1. **Operational Excellence:** Automate tasks, run workloads as code (IaC with CloudFormation or Terraform).
2. **Security:** Defense-in-depth, IAM least-privilege, encrypt data in transit (TLS) and at rest (KMS).
3. **Reliability:** Design for failure! Deploy across multiple Availability Zones (Multi-AZ) and use Auto Scaling.
4. **Performance Efficiency:** Choose the right service for the job (e.g. Serverless Lambda vs Containers vs EC2).
5. **Cost Optimization:** Stop paying for idle capacity; use S3 Lifecycle policies and auto-scaling.
6. **Sustainability:** Minimize environmental footprint by optimizing resource utilization.

Ask me about any specific AWS service (EC2, S3, IAM, Lambda, VPC, RDS, DynamoDB, SQS, CloudFront) or switch between **ELI5 Metaphors**, **Architecture Flows**, and **Exam Traps** above!`;
}

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode, serviceContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1].content;
    let modeGuidance = '';
    if (mode === 'eli5') {
      modeGuidance = '\n[SPECIAL MODE: ELI5 - Explain Like I\'m 5. Use simple everyday metaphors like a restaurant, library, or airport. Avoid excessive technical jargon without explaining it immediately.]';
    } else if (mode === 'architecture') {
      modeGuidance = '\n[SPECIAL MODE: ARCHITECTURE & DATA FLOW - Include a clean ASCII diagram or step-by-step numbered request flow showing component interactions.]';
    } else if (mode === 'cli') {
      modeGuidance = '\n[SPECIAL MODE: HANDS-ON CLI & CODE - Provide concrete AWS CLI commands and AWS SDK (JavaScript/Python) examples with clear explanations.]';
    } else if (mode === 'exam') {
      modeGuidance = '\n[SPECIAL MODE: CERTIFICATION FOCUS - Emphasize key exam keywords, comparison traps (e.g. SQS vs SNS, S3 Standard vs Glacier, IAM Role vs Policy), and sample scenario question insight.]';
    }

    const contextGuidance = serviceContext ? `\n[FOCUSED SERVICE CONTEXT: ${serviceContext}]` : '';
    const promptText = `${messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'AWS Agent'}: ${m.content}`).join('\n\n')}\n\nStudent: ${lastMessage}${modeGuidance}${contextGuidance}\n\nAWS Agent:`;

    const generatedText = await generateGeminiText(promptText, AWS_TUTOR_SYSTEM_INSTRUCTION);

    if (generatedText) {
      return res.json({ reply: generatedText });
    } else {
      // Graceful high-quality fallback
      const fallbackReply = getCuratedTutorReply(lastMessage, mode);
      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const lastMessage = req.body?.messages?.[req.body.messages.length - 1]?.content || 'AWS Cloud';
    return res.json({ reply: getCuratedTutorReply(lastMessage) });
  }
});

// 2. Personalized Learning Path Generator
app.post('/api/learning-path', async (req, res) => {
  try {
    const { background, goal, hoursPerWeek, experienceLevel } = req.body;

    if (ai) {
      const prompt = `Create a comprehensive, personalized AWS Learning Path roadmap for a learner with:
- Background: ${background || 'Beginner'}
- Primary Goal: ${goal || 'AWS Certified Cloud Practitioner'}
- Experience Level: ${experienceLevel || 'Beginner'}
- Commitment: ${hoursPerWeek || 5} hours per week.

Return a structured JSON object with the following schema:
- title: string (Engaging path title)
- description: string (2-3 sentences overview)
- totalWeeks: number
- weeklyCommitment: string
- certificationTarget: string
- modules: array of objects containing:
  - id: string (e.g. "mod-1")
  - title: string
  - week: string (e.g. "Week 1-2")
  - summary: string
  - services: array of strings (e.g. ["IAM", "AWS Organizations", "Billing"])
  - keyConcepts: array of strings
  - handsOnLab: string (practical project to build in the free tier)
  - examTip: string (key thing tested on exams)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AWS curriculum designer. Return strictly valid JSON matching the requested structure without markdown fences if possible or with clean JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              totalWeeks: { type: Type.NUMBER },
              weeklyCommitment: { type: Type.STRING },
              certificationTarget: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    week: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    services: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    keyConcepts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    handsOnLab: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                  },
                  required: ['id', 'title', 'week', 'summary', 'services', 'keyConcepts', 'handsOnLab', 'examTip']
                }
              }
            },
            required: ['title', 'description', 'totalWeeks', 'weeklyCommitment', 'certificationTarget', 'modules']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      // Fallback roadmap
      return res.json({
        title: `AWS Zero-to-Hero: ${goal || 'Cloud Architect'} Path`,
        description: `A custom tailored roadmap built for ${background || 'Learners'} aiming for ${goal || 'AWS Cloud Mastery'} with practical hands-on checkpoints.`,
        totalWeeks: 6,
        weeklyCommitment: `${hoursPerWeek || 5} hours/week`,
        certificationTarget: goal || 'AWS Certified Cloud Practitioner (CLF-C02)',
        modules: [
          {
            id: 'mod-1',
            title: 'Cloud Foundations & Identity Security (IAM)',
            week: 'Week 1',
            summary: 'Understand cloud computing models (IaaS, PaaS, SaaS), AWS Global Infrastructure (Regions, AZs, Edge Locations), and secure IAM best practices.',
            services: ['IAM', 'AWS Organizations', 'AWS Billing & Cost Explorer', 'CloudShell'],
            keyConcepts: ['Root Account Security & MFA', 'Users, Groups, Roles & Policies', 'Principle of Least Privilege', 'Shared Responsibility Model'],
            handsOnLab: 'Set up an AWS Free Tier account, create an IAM Admin user with MFA, enforce a strict password policy, and create a billing alarm at $5.',
            examTip: 'Exam trap: Never create access keys for the Root user! Always use IAM Roles for EC2 instances rather than storing credentials.'
          },
          {
            id: 'mod-2',
            title: 'Compute Essentials: Virtual Servers & Serverless',
            week: 'Week 2',
            summary: 'Explore compute engines: Amazon EC2 virtual machines, pricing models, Auto Scaling, Elastic Load Balancers, and event-driven AWS Lambda.',
            services: ['Amazon EC2', 'AWS Lambda', 'ALB (Application Load Balancer)', 'Auto Scaling Groups'],
            keyConcepts: ['On-Demand vs Spot vs Reserved Instances', 'Security Groups vs NACLs', 'Stateless vs Stateful Compute', 'Lambda Execution Roles & Triggers'],
            handsOnLab: 'Launch an EC2 t2.micro web server with user data script serving an HTML page, put it behind an Application Load Balancer with a target group.',
            examTip: 'Spot instances can save up to 90% but can be interrupted with 2 minutes notice—only use for fault-tolerant workloads.'
          },
          {
            id: 'mod-3',
            title: 'Storage & Content Delivery',
            week: 'Week 3',
            summary: 'Master Object, Block, and File storage on AWS, plus global low-latency caching with CloudFront CDN.',
            services: ['Amazon S3', 'Amazon EBS', 'Amazon EFS', 'Amazon CloudFront'],
            keyConcepts: ['S3 Storage Classes & Lifecycle Rules', 'S3 Bucket Policies & Versioning', 'EBS Volumes vs Snapshots', 'CloudFront Origin & Edge Caching'],
            handsOnLab: 'Host a static portfolio website on Amazon S3 with an encrypted bucket, and distribute it globally via Amazon CloudFront with HTTPS.',
            examTip: 'S3 Standard-Infrequent Access (S3 Standard-IA) is for data accessed less frequently but requiring rapid access when needed; has a retrieval fee.'
          },
          {
            id: 'mod-4',
            title: 'Networking & Isolated Clouds: VPC Deep Dive',
            week: 'Week 4',
            summary: 'Design a private, resilient network topology using VPC, Public/Private Subnets, Internet Gateways, and NAT Gateways.',
            services: ['Amazon VPC', 'Subnets', 'Internet Gateway', 'NAT Gateway', 'Route Tables'],
            keyConcepts: ['CIDR Blocks & IP Planning', 'Public Subnet vs Private Subnet', 'NAT Gateway vs Internet Gateway', 'Stateful Security Groups vs Stateless NACLs'],
            handsOnLab: 'Create a custom VPC with 2 public subnets and 2 private subnets across 2 AZs, configure route tables, and test private connectivity.',
            examTip: 'Security Groups are stateful (inbound reply is automatically allowed out). NACLs are stateless and apply at the subnet level.'
          },
          {
            id: 'mod-5',
            title: 'Managed Databases & Caching',
            week: 'Week 5',
            summary: 'Understand relational vs NoSQL databases on AWS, Multi-AZ deployments, read replicas, and fast memory caching.',
            services: ['Amazon RDS', 'Amazon Aurora', 'Amazon DynamoDB', 'Amazon ElastiCache'],
            keyConcepts: ['Multi-AZ for Disaster Recovery vs Read Replicas for Performance', 'DynamoDB Partition Keys & Sort Keys', 'Serverless NoSQL scaling'],
            handsOnLab: 'Spin up a free-tier PostgreSQL RDS instance in a private subnet, connect securely from an EC2 instance, and create a sample DynamoDB table.',
            examTip: 'Multi-AZ RDS is synchronous replication across Availability Zones for High Availability; Read Replicas are asynchronous for read scale.'
          },
          {
            id: 'mod-6',
            title: 'Monitoring, Automation & Architecture Review',
            week: 'Week 6',
            summary: 'Bring it all together with CloudWatch monitoring, CloudTrail auditing, Infrastructure as Code, and the AWS Well-Architected Framework.',
            services: ['Amazon CloudWatch', 'AWS CloudTrail', 'AWS CloudFormation', 'AWS Well-Architected Tool'],
            keyConcepts: ['Metrics vs Logs vs Alarms', 'CloudTrail for Governance & API Audit', 'The 6 Well-Architected Pillars', 'Exam Practice Drills'],
            handsOnLab: 'Build an automated CloudWatch alarm that sends an SNS email alert when EC2 CPU exceeds 80%, and audit actions in CloudTrail.',
            examTip: 'CloudWatch monitors performance metrics and health. CloudTrail tracks WHO made WHAT API call WHEN and from WHERE.'
          }
        ]
      });
    }
  } catch (error: any) {
    console.warn('Fallback triggered for /api/learning-path:', error.message || error);
    return res.json({
      title: `AWS Zero-to-Hero: ${req.body?.goal || 'Cloud Architect'} Path`,
      description: `A custom tailored roadmap built for ${req.body?.background || 'Learners'} aiming for ${req.body?.goal || 'AWS Cloud Mastery'} with practical hands-on checkpoints.`,
      totalWeeks: 6,
      weeklyCommitment: `${req.body?.hoursPerWeek || 5} hours/week`,
      certificationTarget: req.body?.goal || 'AWS Certified Cloud Practitioner (CLF-C02)',
      modules: [
        {
          id: 'mod-1',
          title: 'Cloud Foundations & Identity Security (IAM)',
          week: 'Week 1',
          summary: 'Understand cloud computing models (IaaS, PaaS, SaaS), AWS Global Infrastructure (Regions, AZs, Edge Locations), and secure IAM best practices.',
          services: ['IAM', 'AWS Organizations', 'AWS Billing & Cost Explorer', 'CloudShell'],
          keyConcepts: ['Root Account Security & MFA', 'Users, Groups, Roles & Policies', 'Principle of Least Privilege', 'Shared Responsibility Model'],
          handsOnLab: 'Set up an AWS Free Tier account, create an IAM Admin user with MFA, enforce a strict password policy, and create a billing alarm at $5.',
          examTip: 'Exam trap: Never create access keys for the Root user! Always use IAM Roles for EC2 instances rather than storing credentials.'
        },
        {
          id: 'mod-2',
          title: 'Compute Essentials: Virtual Servers & Serverless',
          week: 'Week 2',
          summary: 'Explore compute engines: Amazon EC2 virtual machines, pricing models, Auto Scaling, Elastic Load Balancers, and event-driven AWS Lambda.',
          services: ['Amazon EC2', 'AWS Lambda', 'ALB (Application Load Balancer)', 'Auto Scaling Groups'],
          keyConcepts: ['On-Demand vs Spot vs Reserved Instances', 'Security Groups vs NACLs', 'Stateless vs Stateful Compute', 'Lambda Execution Roles & Triggers'],
          handsOnLab: 'Launch an EC2 t2.micro web server with user data script serving an HTML page, put it behind an Application Load Balancer with a target group.',
          examTip: 'Spot instances can save up to 90% but can be interrupted with 2 minutes notice—only use for fault-tolerant workloads.'
        },
        {
          id: 'mod-3',
          title: 'Storage & Content Delivery',
          week: 'Week 3',
          summary: 'Master Object, Block, and File storage on AWS, plus global low-latency caching with CloudFront CDN.',
          services: ['Amazon S3', 'Amazon EBS', 'Amazon EFS', 'Amazon CloudFront'],
          keyConcepts: ['S3 Storage Classes & Lifecycle Rules', 'S3 Bucket Policies & Versioning', 'EBS Volumes vs Snapshots', 'CloudFront Origin & Edge Caching'],
          handsOnLab: 'Host a static portfolio website on Amazon S3 with an encrypted bucket, and distribute it globally via Amazon CloudFront with HTTPS.',
          examTip: 'S3 Standard-Infrequent Access (S3 Standard-IA) is for data accessed less frequently but requiring rapid access when needed; has a retrieval fee.'
        },
        {
          id: 'mod-4',
          title: 'Networking & Isolated Clouds: VPC Deep Dive',
          week: 'Week 4',
          summary: 'Design a private, resilient network topology using VPC, Public/Private Subnets, Internet Gateways, and NAT Gateways.',
          services: ['Amazon VPC', 'Subnets', 'Internet Gateway', 'NAT Gateway', 'Route Tables'],
          keyConcepts: ['CIDR Blocks & IP Planning', 'Public Subnet vs Private Subnet', 'NAT Gateway vs Internet Gateway', 'Stateful Security Groups vs Stateless NACLs'],
          handsOnLab: 'Create a custom VPC with 2 public subnets and 2 private subnets across 2 AZs, configure route tables, and test private connectivity.',
          examTip: 'Security Groups are stateful (inbound reply is automatically allowed out). NACLs are stateless and apply at the subnet level.'
        },
        {
          id: 'mod-5',
          title: 'Managed Databases & Caching',
          week: 'Week 5',
          summary: 'Understand relational vs NoSQL databases on AWS, Multi-AZ deployments, read replicas, and fast memory caching.',
          services: ['Amazon RDS', 'Amazon Aurora', 'Amazon DynamoDB', 'Amazon ElastiCache'],
          keyConcepts: ['Multi-AZ for Disaster Recovery vs Read Replicas for Performance', 'DynamoDB Partition Keys & Sort Keys', 'Serverless NoSQL scaling'],
          handsOnLab: 'Spin up a free-tier PostgreSQL RDS instance in a private subnet, connect securely from an EC2 instance, and create a sample DynamoDB table.',
          examTip: 'Multi-AZ RDS is synchronous replication across Availability Zones for High Availability; Read Replicas are asynchronous for read scale.'
        },
        {
          id: 'mod-6',
          title: 'Monitoring, Automation & Architecture Review',
          week: 'Week 6',
          summary: 'Bring it all together with CloudWatch monitoring, CloudTrail auditing, Infrastructure as Code, and the AWS Well-Architected Framework.',
          services: ['Amazon CloudWatch', 'AWS CloudTrail', 'AWS CloudFormation', 'AWS Well-Architected Tool'],
          keyConcepts: ['Metrics vs Logs vs Alarms', 'CloudTrail for Governance & API Audit', 'The 6 Well-Architected Pillars', 'Exam Practice Drills'],
          handsOnLab: 'Build an automated CloudWatch alarm that sends an SNS email alert when EC2 CPU exceeds 80%, and audit actions in CloudTrail.',
          examTip: 'CloudWatch monitors performance metrics and health. CloudTrail tracks WHO made WHAT API call WHEN and from WHERE.'
        }
      ]
    });
  }
});

// 3. Quiz Generator Endpoint
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const numQuestions = Math.min(Math.max(Number(count) || 5, 3), 10);

    if (ai) {
      const prompt = `Generate ${numQuestions} realistic, high-quality multiple choice practice questions for AWS learners.
Topic: ${topic || 'General AWS Cloud Practitioner & Solutions Architect'}
Difficulty Level: ${difficulty || 'Beginner / Intermediate'}

Each question must test real understanding with a scenario, not just dry definitions.
Ensure 4 clear choices, with 1 unambiguously correct choice.
Provide a comprehensive explanation explaining why the correct choice is right and why the distractors are wrong.
Include an 'examTip' highlighting the certification exam keyword/pattern.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AWS Certification exam author. Return strictly JSON with questions array.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    scenario: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                    service: { type: Type.STRING }
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'examTip', 'service']
                }
              }
            },
            required: ['questions']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      // Fallback questions
      return res.json({
        questions: [
          {
            id: 'q1',
            question: 'Which AWS service should a company use to host a static website with high availability and minimal management overhead?',
            scenario: 'A startup wants to host their marketing website consisting of HTML, CSS, client-side JavaScript, and images without managing any operating systems or virtual servers.',
            options: [
              'Amazon EC2 with an Elastic IP address',
              'Amazon S3 Static Website Hosting configured with Amazon CloudFront',
              'AWS Elastic Beanstalk with Multi-AZ deployment',
              'Amazon EBS mounted to an Amazon RDS database'
            ],
            correctIndex: 1,
            explanation: 'Amazon S3 provides native static website hosting with 99.999999999% durability, zero server management, and when paired with Amazon CloudFront, delivers global low-latency caching and HTTPS SSL termination at a fraction of EC2 costs.',
            examTip: 'Whenever you see "static website" and "lowest administrative overhead / cost", the correct answer is almost always Amazon S3 + CloudFront.',
            service: 'Amazon S3 & CloudFront'
          },
          {
            id: 'q2',
            question: 'An application requires a database that can handle millions of requests per second with single-digit millisecond latency and a flexible schema. Which service is best suited?',
            scenario: 'A mobile gaming company needs to store player profiles, game states, and real-time leaderboards with unpredictable global traffic spikes.',
            options: [
              'Amazon RDS for PostgreSQL',
              'Amazon Redshift',
              'Amazon DynamoDB',
              'Amazon Aurora Multi-Master'
            ],
            correctIndex: 2,
            explanation: 'Amazon DynamoDB is a fully managed, serverless NoSQL key-value and document database that delivers consistent single-digit millisecond response times at any scale with automatic horizontal partitioning.',
            examTip: 'Look for keywords: "key-value", "NoSQL", "single-digit millisecond latency", and "serverless database". That points straight to DynamoDB.',
            service: 'Amazon DynamoDB'
          },
          {
            id: 'q3',
            question: 'A solutions architect needs EC2 instances in a private subnet to securely download software patches from the internet while preventing incoming connections from the internet. What should be used?',
            scenario: 'Financial backend application servers reside in a private subnet and must never accept incoming connections from the public web, but must download OS updates.',
            options: [
              'Internet Gateway attached to the private subnet',
              'NAT Gateway in a public subnet with routes updated in the private subnet route table',
              'VPC Peering connection to another company',
              'Network Access Control List (NACL) with only outbound rules'
            ],
            correctIndex: 1,
            explanation: 'A NAT (Network Address Translation) Gateway lives in a public subnet and translates private IP addresses to its Elastic IP, allowing private instances outbound access to the internet while rejecting unsolicited inbound traffic.',
            examTip: 'A NAT Gateway must ALWAYS be deployed in a PUBLIC subnet, not in the private subnet itself!',
            service: 'Amazon VPC'
          },
          {
            id: 'q4',
            question: 'Which IAM entity should be attached to an Amazon EC2 instance so it can securely access an Amazon S3 bucket without hardcoded credentials?',
            scenario: 'A web application running on EC2 instances needs to upload user image uploads directly to an S3 bucket securely.',
            options: [
              'An IAM User with access keys written in the application configuration file',
              'An IAM Role attached to an EC2 Instance Profile',
              'An IAM Group containing all EC2 instance IDs',
              'A KMS symmetric master key embedded in the AMI'
            ],
            correctIndex: 1,
            explanation: 'IAM Roles provide temporary, automatically rotated security credentials via the EC2 Instance Metadata Service (IMDS). This completely eliminates the severe security hazard of hardcoding static access keys in code or config files.',
            examTip: 'Never store access keys on EC2! Always use an IAM Role. AWS automatically manages rotation and temporary STS credentials.',
            service: 'AWS IAM'
          },
          {
            id: 'q5',
            question: 'According to the AWS Shared Responsibility Model, which of the following is the customer\'s responsibility when using Amazon EC2?',
            scenario: 'A company deploys their application on EC2 virtual servers across multiple regions.',
            options: [
              'Physical security of the data center facilities',
              'Patching the guest operating system and configuring host firewalls',
              'Decommissioning faulty physical storage drives',
              'Maintaining the hypervisor virtualization software'
            ],
            correctIndex: 1,
            explanation: 'Under the Shared Responsibility Model, AWS is responsible for "Security OF the Cloud" (hardware, physical data centers, host hypervisors, facilities). The customer is responsible for "Security IN the Cloud" (guest OS patches, antivirus, user data, firewall/security group rules, IAM permissions).',
            examTip: 'Remember the golden rule: AWS manages the hypervisor down; you manage the OS up (for IaaS like EC2). For serverless/managed services like S3 or Lambda, AWS also manages the OS.',
            service: 'Shared Responsibility Model'
          }
        ]
      });
    }
  } catch (error: any) {
    console.warn('Fallback triggered for /api/quiz:', error.message || error);
    return res.json({
      questions: [
        {
          id: 'q1',
          question: 'Which AWS service should a company use to host a static website with high availability and minimal management overhead?',
          scenario: 'A startup wants to host their marketing website consisting of HTML, CSS, client-side JavaScript, and images without managing any operating systems or virtual servers.',
          options: [
            'Amazon EC2 with an Elastic IP address',
            'Amazon S3 Static Website Hosting configured with Amazon CloudFront',
            'AWS Elastic Beanstalk with Multi-AZ deployment',
            'Amazon EBS mounted to an Amazon RDS database'
          ],
          correctIndex: 1,
          explanation: 'Amazon S3 provides native static website hosting with 99.999999999% durability, zero server management, and when paired with Amazon CloudFront, delivers global low-latency caching and HTTPS SSL termination at a fraction of EC2 costs.',
          examTip: 'Whenever you see "static website" and "lowest administrative overhead / cost", the correct answer is almost always Amazon S3 + CloudFront.',
          service: 'Amazon S3 & CloudFront'
        },
        {
          id: 'q2',
          question: 'An application requires a database that can handle millions of requests per second with single-digit millisecond latency and a flexible schema. Which service is best suited?',
          scenario: 'A mobile gaming company needs to store player profiles, game states, and real-time leaderboards with unpredictable global traffic spikes.',
          options: [
            'Amazon RDS for PostgreSQL',
            'Amazon Redshift',
            'Amazon DynamoDB',
            'Amazon Aurora Multi-Master'
          ],
          correctIndex: 2,
          explanation: 'Amazon DynamoDB is a fully managed, serverless NoSQL key-value and document database that delivers consistent single-digit millisecond response times at any scale with automatic horizontal partitioning.',
          examTip: 'Look for keywords: "key-value", "NoSQL", "single-digit millisecond latency", and "serverless database". That points straight to DynamoDB.',
          service: 'Amazon DynamoDB'
        },
        {
          id: 'q3',
          question: 'A solutions architect needs EC2 instances in a private subnet to securely download software patches from the internet while preventing incoming connections from the internet. What should be used?',
          scenario: 'Financial backend application servers reside in a private subnet and must never accept incoming connections from the public web, but must download OS updates.',
          options: [
            'Internet Gateway attached to the private subnet',
            'NAT Gateway in a public subnet with routes updated in the private subnet route table',
            'VPC Peering connection to another company',
            'Network Access Control List (NACL) with only outbound rules'
          ],
          correctIndex: 1,
          explanation: 'A NAT (Network Address Translation) Gateway lives in a public subnet and translates private IP addresses to its Elastic IP, allowing private instances outbound access to the internet while rejecting unsolicited inbound traffic.',
          examTip: 'A NAT Gateway must ALWAYS be deployed in a PUBLIC subnet, not in the private subnet itself!',
          service: 'Amazon VPC'
        },
        {
          id: 'q4',
          question: 'Which IAM entity should be attached to an Amazon EC2 instance so it can securely access an Amazon S3 bucket without hardcoded credentials?',
          scenario: 'A web application running on EC2 instances needs to upload user image uploads directly to an S3 bucket securely.',
          options: [
            'An IAM User with access keys written in the application configuration file',
            'An IAM Role attached to an EC2 Instance Profile',
            'An IAM Group containing all EC2 instance IDs',
            'A KMS symmetric master key embedded in the AMI'
          ],
          correctIndex: 1,
          explanation: 'IAM Roles provide temporary, automatically rotated security credentials via the EC2 Instance Metadata Service (IMDS). This completely eliminates the severe security hazard of hardcoding static access keys in code or config files.',
          examTip: 'Never store access keys on EC2! Always use an IAM Role. AWS automatically manages rotation and temporary STS credentials.',
          service: 'AWS IAM'
        },
        {
          id: 'q5',
          question: 'According to the AWS Shared Responsibility Model, which of the following is the customer\'s responsibility when using Amazon EC2?',
          scenario: 'A company deploys their application on EC2 virtual servers across multiple regions.',
          options: [
            'Physical security of the data center facilities',
            'Patching the guest operating system and configuring host firewalls',
            'Decommissioning faulty physical storage drives',
            'Maintaining the hypervisor virtualization software'
          ],
          correctIndex: 1,
          explanation: 'Under the Shared Responsibility Model, AWS is responsible for "Security OF the Cloud" (hardware, physical data centers, host hypervisors, facilities). The customer is responsible for "Security IN the Cloud" (guest OS patches, antivirus, user data, firewall/security group rules, IAM permissions).',
          examTip: 'Remember the golden rule: AWS manages the hypervisor down; you manage the OS up (for IaaS like EC2). For serverless/managed services like S3 or Lambda, AWS also manages the OS.',
          service: 'Shared Responsibility Model'
        }
      ]
    });
  }
});

// 4. Interactive Scenario Troubleshooter ("Fix the Cloud Architecture")
app.post('/api/scenario-challenge', async (req, res) => {
  try {
    const { category } = req.body;

    if (ai) {
      const prompt = `Create an interactive real-world AWS incident / architectural troubleshooting scenario for cloud learners.
Category: ${category || 'Architecture & Reliability'}

Format as JSON with:
- id: string
- title: string (e.g. "The Mystery $3,000 Bill Spike", "The 504 Gateway Timeout Storm", "The Leaked Database Credentials")
- context: string (the situation facing the team)
- symptoms: array of strings
- architecture: string (description of the current setup)
- options: array of 4 objects { id: 'A'|'B'|'C'|'D', title: string, explanation: string, isBestSolution: boolean, tradeOffs: string }
- wellArchitectedPillar: string (e.g. Cost Optimization, Reliability, Security, Performance Efficiency, Operational Excellence)
- takeaway: string (key engineering principle)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AWS Principal Architect. Return strictly valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              context: { type: Type.STRING },
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              architecture: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    isBestSolution: { type: Type.BOOLEAN },
                    tradeOffs: { type: Type.STRING }
                  },
                  required: ['id', 'title', 'explanation', 'isBestSolution', 'tradeOffs']
                }
              },
              wellArchitectedPillar: { type: Type.STRING },
              takeaway: { type: Type.STRING }
            },
            required: ['id', 'title', 'context', 'symptoms', 'architecture', 'options', 'wellArchitectedPillar', 'takeaway']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } else {
      return res.json({
        id: 'scenario-nat-bill',
        title: 'The Mystery $4,200 AWS Bill Spike',
        context: 'A video streaming startup noticed their monthly AWS bill jumped from $300 to $4,500. Upon checking AWS Cost Explorer, 90% of the cost is attributed to "VPC: NAT Gateway Data Transfer - Bytes".',
        symptoms: [
          'High monthly charges under EC2 / VPC NAT Gateway Data Processing',
          'Application instances in private subnets are continuously downloading 500GB of video assets from an S3 bucket',
          'Zero external user traffic changes'
        ],
        architecture: 'EC2 video transcoder instances residing in private subnets, streaming video files directly from an Amazon S3 bucket located in the same AWS region.',
        options: [
          {
            id: 'A',
            title: 'Move all EC2 transcoders into a Public Subnet with Public IPs',
            explanation: 'While this avoids the NAT Gateway, placing core processing instances in a public subnet exposes them to the public internet and violates basic security isolation principles.',
            isBestSolution: false,
            tradeOffs: 'Severe security risk; still incurs internet data transfer overhead without private routing.'
          },
          {
            id: 'B',
            title: 'Create a free VPC Gateway Endpoint for Amazon S3',
            explanation: 'VPC Gateway Endpoints for S3 allow instances in private subnets to communicate with Amazon S3 directly across the AWS internal network backbone without going through a NAT Gateway or public internet, incurring $0 data processing fees!',
            isBestSolution: true,
            tradeOffs: 'Takes 2 minutes to create in the VPC console; free of charge; zero code changes required.'
          },
          {
            id: 'C',
            title: 'Switch to a larger NAT Gateway instance size',
            explanation: 'NAT Gateways are managed by AWS and automatically scale up to 100 Gbps. The cost is driven by data transfer volume ($0.045/GB), not instance size.',
            isBestSolution: false,
            tradeOffs: 'Does not solve the root cause; will not reduce the bill at all.'
          },
          {
            id: 'D',
            title: 'Download the videos through an AWS Transit Gateway',
            explanation: 'Transit Gateways also charge per GB of processed data and will make the bill even more expensive.',
            isBestSolution: false,
            tradeOffs: 'Increases complexity and adds additional per-hour and per-GB charges.'
          }
        ],
        wellArchitectedPillar: 'Cost Optimization & Architecture Reliability',
        takeaway: 'Always use VPC Gateway Endpoints for S3 and DynamoDB inside private subnets to avoid hefty NAT Gateway per-gigabyte data transfer charges.'
      });
    }
  } catch (error: any) {
    console.warn('Fallback triggered for /api/scenario-challenge:', error.message || error);
    return res.json({
      id: 'scenario-nat-bill',
      title: 'The Mystery $4,200 AWS Bill Spike',
      context: 'A video streaming startup noticed their monthly AWS bill jumped from $300 to $4,500. Upon checking AWS Cost Explorer, 90% of the cost is attributed to "VPC: NAT Gateway Data Transfer - Bytes".',
      symptoms: [
        'High monthly charges under EC2 / VPC NAT Gateway Data Processing',
        'Application instances in private subnets are continuously downloading 500GB of video assets from an S3 bucket',
        'Zero external user traffic changes'
      ],
      architecture: 'EC2 video transcoder instances residing in private subnets, streaming video files directly from an Amazon S3 bucket located in the same AWS region.',
      options: [
        {
          id: 'A',
          title: 'Move all EC2 transcoders into a Public Subnet with Public IPs',
          explanation: 'While this avoids the NAT Gateway, placing core processing instances in a public subnet exposes them to the public internet and violates basic security isolation principles.',
          isBestSolution: false,
          tradeOffs: 'Severe security risk; still incurs internet data transfer overhead without private routing.'
        },
        {
          id: 'B',
          title: 'Create a free VPC Gateway Endpoint for Amazon S3',
          explanation: 'VPC Gateway Endpoints for S3 allow instances in private subnets to communicate with Amazon S3 directly across the AWS internal network backbone without going through a NAT Gateway or public internet, incurring $0 data processing fees!',
          isBestSolution: true,
          tradeOffs: 'Takes 2 minutes to create in the VPC console; free of charge; zero code changes required.'
        },
        {
          id: 'C',
          title: 'Switch to a larger NAT Gateway instance size',
          explanation: 'NAT Gateways are managed by AWS and automatically scale up to 100 Gbps. The cost is driven by data transfer volume ($0.045/GB), not instance size.',
          isBestSolution: false,
          tradeOffs: 'Does not solve the root cause; will not reduce the bill at all.'
        },
        {
          id: 'D',
          title: 'Download the videos through an AWS Transit Gateway',
          explanation: 'Transit Gateways also charge per GB of processed data and will make the bill even more expensive.',
          isBestSolution: false,
          tradeOffs: 'Increases complexity and adds additional per-hour and per-GB charges.'
        }
      ],
      wellArchitectedPillar: 'Cost Optimization & Architecture Reliability',
      takeaway: 'Always use VPC Gateway Endpoints for S3 and DynamoDB inside private subnets to avoid hefty NAT Gateway per-gigabyte data transfer charges.'
    });
  }
});

// Setup Vite middleware in dev or static serving in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`AWS Learning Agent server running on http://0.0.0.0:${PORT}`);
});
