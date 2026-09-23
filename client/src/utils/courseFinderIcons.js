import {
    Target, Repeat, TrendingUp, GraduationCap, Rocket, Lightbulb, Laptop, BarChart3,
    Megaphone, HeartPulse, Wallet, Users, Briefcase, Palette, Handshake, MoreHorizontal,
    BookOpen, FileCheck, Award, Clock, Sparkles, FileSpreadsheet, Database, Code,
    MessageCircle, Star, PlayCircle, Radio, Folder, Bot, CheckCircle, MapPin, Globe,
    Building2, Compass, ClipboardCheck, Circle
} from 'lucide-react';

export const COURSE_FINDER_ICON_MAP = {
    Target, Repeat, TrendingUp, GraduationCap, Rocket, Lightbulb, Laptop, BarChart3,
    Megaphone, HeartPulse, Wallet, Users, Briefcase, Palette, Handshake, MoreHorizontal,
    BookOpen, FileCheck, Award, Clock, Sparkles, FileSpreadsheet, Database, Code,
    MessageCircle, Star, PlayCircle, Radio, Folder, Bot, CheckCircle, MapPin, Globe,
    Building2, Compass, ClipboardCheck, Circle
};

export const COURSE_FINDER_ICON_NAMES = Object.keys(COURSE_FINDER_ICON_MAP);

export const getCourseFinderIcon = (name) => COURSE_FINDER_ICON_MAP[name] || Circle;
