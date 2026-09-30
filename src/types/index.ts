export type TutorMode = 'standard' | 'eli5' | 'architecture' | 'cli' | 'exam';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: TutorMode;
  serviceContext?: string;
}

export interface AWSService {
  id: string;
  name: string;
  code: string;
  category: 'Compute' | 'Storage' | 'Database' | 'Networking' | 'Security & IAM' | 'Serverless & Integration' | 'Monitoring & Management' | 'Analytics & AI';
  tagline: string;
  analogy: string;
  description: string;
  freeTier: string;
  keyFeatures: string[];
  commonUseCases: string[];
  cliExample: string;
  examTip: string;
  color: string;
  iconName: string;
}

export interface RoadmapModule {
  id: string;
  title: string;
  week: string;
  summary: string;
  services: string[];
  keyConcepts: string[];
  handsOnLab: string;
  examTip: string;
  completed?: boolean;
}

export interface LearningPath {
  title: string;
  description: string;
  totalWeeks: number;
  weeklyCommitment: string;
  certificationTarget: string;
  modules: RoadmapModule[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examTip: string;
  service: string;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  service: string;
  category: string;
  role: string;
  details: string;
  securityTip: string;
  iconName: string;
  x: number;
  y: number;
}

export interface ArchitectureBlueprint {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  dataFlowSteps: string[];
  keyServices: string[];
  nodes: ArchitectureNode[];
  connections: { from: string; to: string; label: string }[];
  costEstimator: string;
  wellArchitectedPillar: string;
}

export interface ScenarioChallenge {
  id: string;
  title: string;
  context: string;
  symptoms: string[];
  architecture: string;
  options: {
    id: string;
    title: string;
    explanation: string;
    isBestSolution: boolean;
    tradeOffs: string;
  }[];
  wellArchitectedPillar: string;
  takeaway: string;
}
