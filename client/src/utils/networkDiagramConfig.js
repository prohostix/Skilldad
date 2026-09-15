import {
    Sparkles, BookOpen, Landmark, Handshake, Bot, Award, Briefcase, GraduationCap,
    Brain, Cpu, Globe, Shield, Laptop, Code, Rocket, Target, Layers, FileCheck,
    Star, Zap, Building2, TrendingUp, Compass, Users, CheckCircle, Heart, Folder, Lightbulb
} from 'lucide-react';
import skilldadLogo from '../assets/logo.png';

export const DIAGRAM_ICON_MAP = {
    Sparkles,
    BookOpen,
    Landmark,
    Handshake,
    Bot,
    Award,
    Briefcase,
    GraduationCap,
    Brain,
    Cpu,
    Globe,
    Shield,
    Laptop,
    Code,
    Rocket,
    Target,
    Layers,
    FileCheck,
    Star,
    Zap,
    Building2,
    TrendingUp,
    Compass,
    Users,
    CheckCircle,
    Heart,
    Folder,
    Lightbulb
};

export const AVAILABLE_ICON_NAMES = Object.keys(DIAGRAM_ICON_MAP);

export const DEFAULT_DIAGRAM_NODES = [
    {
        id: 'root',
        x: 160,
        y: 220,
        r: 22,
        label: 'SkillDad',
        delay: 0,
        iconName: 'Sparkles',
        image: skilldadLogo,
        imageFit: 'contain',
        imageBg: '#ffffff',
        highlight: true,
        isRoot: true,
        description: 'Central hub anchoring the whole ecosystem'
    },
    {
        id: 'courses',
        x: 55,
        y: 100,
        r: 22,
        label: 'Courses',
        delay: 0.3,
        iconName: 'BookOpen',
        image: '/assets/diagram_courses.jpg?v=2',
        imageFit: 'cover',
        imageBg: '',
        description: 'Industry-aligned curriculum & learning tracks'
    },
    {
        id: 'university',
        x: 275,
        y: 80,
        r: 22,
        label: 'University',
        delay: 0.6,
        iconName: 'Landmark',
        image: '/assets/diagram_university.jpg?v=1',
        imageFit: 'cover',
        imageBg: '',
        description: 'Global university partners & ECTS credits'
    },
    {
        id: 'partner',
        x: 315,
        y: 245,
        r: 22,
        label: 'Partners',
        delay: 0.9,
        iconName: 'Handshake',
        image: '/assets/diagram_partners.jpg?v=2',
        imageFit: 'cover',
        imageBg: '',
        description: 'B2B course providers & enterprise training partners'
    },
    {
        id: 'ai',
        x: 45,
        y: 335,
        r: 22,
        label: 'AI Engine',
        delay: 1.2,
        iconName: 'Bot',
        image: '/assets/diagram_ai.jpg?v=2',
        imageFit: 'cover',
        imageBg: '',
        description: 'AI LMS, smart recommendations & tracking'
    },
    {
        id: 'cert',
        x: 225,
        y: 385,
        r: 22,
        label: 'Certs',
        delay: 1.5,
        iconName: 'Award',
        image: '/assets/diagram_certs.jpg?v=2',
        imageFit: 'cover',
        imageBg: '',
        description: 'Verified certificates & graduation credentials'
    },
    {
        id: 'job',
        x: 350,
        y: 355,
        r: 22.5,
        label: 'Jobs',
        delay: 1.8,
        iconName: 'Briefcase',
        image: '/assets/diagram_jobs.jpg?v=5',
        imageFit: 'cover',
        imageBg: '',
        description: 'Placement drives & career opportunities'
    },
    {
        id: 'student',
        x: 130,
        y: 460,
        r: 22,
        label: 'Student',
        delay: 2.1,
        iconName: 'GraduationCap',
        image: '/assets/diagram_student.jpg?v=2',
        imageFit: 'cover',
        imageBg: '',
        description: 'Learners, candidates & alumni'
    },
];

export const getMergedDiagramNodes = (customConfig = {}) => {
    return DEFAULT_DIAGRAM_NODES.map((defNode) => {
        const custom = customConfig?.[defNode.id];
        if (!custom) {
            return {
                ...defNode,
                defaultImage: defNode.image,
                icon: DIAGRAM_ICON_MAP[defNode.iconName] || Sparkles
            };
        }

        const iconName = custom.iconName || defNode.iconName;
        const iconComponent = DIAGRAM_ICON_MAP[iconName] || DIAGRAM_ICON_MAP[defNode.iconName] || Sparkles;
        const customImg = (typeof custom.image === 'string' && custom.image.trim() !== '') ? custom.image : null;

        return {
            ...defNode,
            label: custom.label !== undefined && custom.label !== '' ? custom.label : defNode.label,
            iconName: iconName,
            icon: iconComponent,
            image: customImg || defNode.image,
            defaultImage: defNode.image,
            imageFit: custom.imageFit || defNode.imageFit || 'cover',
            imageBg: custom.imageBg !== undefined ? custom.imageBg : defNode.imageBg
        };
    });
};
