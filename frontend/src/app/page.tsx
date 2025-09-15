'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Target,
  Award,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  TrendingUp,
  Brain,
  Globe,
  Sparkles,
  Play,
  Shield,
  Zap,
  Heart,
  ChevronRight,
  Quote,
  Rocket,
  BookMarked,
  Monitor
} from 'lucide-react';

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: "Expert Teachers",
      description: "Learn from qualified and experienced educators with proven track records",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Video,
      title: "Live & Recorded Classes",
      description: "Flexible learning with live interactive sessions and recorded content",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Brain,
      title: "Smart Learning",
      description: "AI-powered personalized learning paths tailored to your needs",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Interactive Community",
      description: "Engage with teachers and peers in our collaborative learning environment",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Trophy,
      title: "Performance Analytics",
      description: "Track your progress with detailed insights and performance metrics",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Certified curriculum and teaching methodologies for guaranteed results",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { value: 10000, label: "Happy Students", suffix: "+", icon: Users },
    { value: 500, label: "Expert Teachers", suffix: "+", icon: GraduationCap },
    { value: 50, label: "Courses Available", suffix: "+", icon: BookOpen },
    { value: 95, label: "Success Rate", suffix: "%", icon: Trophy }
  ];

  const courses = [
    {
      title: "Advanced Mathematics",
      grade: "Grade 9-12",
      students: 2341,
      rating: 4.9,
      price: "₹2,999",
      duration: "6 months",
      lessons: 45,
      category: "STEM",
      gradient: "from-blue-600 to-cyan-600",
      icon: Target
    },
    {
      title: "Physics & Chemistry",
      grade: "Grade 11-12",
      students: 1892,
      rating: 4.8,
      price: "₹3,499",
      duration: "8 months",
      lessons: 52,
      category: "Science",
      gradient: "from-emerald-600 to-teal-600",
      icon: Zap
    },
    {
      title: "English Literature",
      grade: "Grade 6-12",
      students: 1567,
      rating: 4.7,
      price: "₹1,999",
      duration: "4 months",
      lessons: 32,
      category: "Language",
      gradient: "from-purple-600 to-pink-600",
      icon: BookMarked
    },
    {
      title: "Computer Science",
      grade: "Grade 8-12",
      students: 987,
      rating: 4.9,
      price: "₹4,999",
      duration: "10 months",
      lessons: 60,
      category: "Technology",
      gradient: "from-orange-600 to-red-600",
      icon: Monitor
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Grade 12 Student",
      content: "The personalized learning approach and interactive classes transformed my academic performance. I scored 95% in mathematics!",
      rating: 5,
      avatar: "SJ",
      location: "Mumbai, India",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Michael Chen",
      role: "Parent",
      content: "My daughter's confidence has grown tremendously. The teachers provide excellent support and the progress tracking keeps us informed.",
      rating: 5,
      avatar: "MC",
      location: "Delhi, India",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Emily Davis",
      role: "Grade 11 Student",
      content: "The flexibility of learning and quality of content is outstanding. Perfect preparation for competitive exams!",
      rating: 5,
      avatar: "ED",
      location: "Bangalore, India",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const AnimatedCounter = ({ end, suffix = "", icon: Icon }: { end: number; suffix?: string; icon: any }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (statsVisible) {
        const duration = 2000;
        const steps = 50;
        const increment = end / steps;
        const stepTime = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, stepTime);

        return () => clearInterval(timer);
      }
    }, [end, statsVisible]);

    return (
      <div className="text-center transform hover:scale-105 transition-transform duration-300">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <p className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
          {count.toLocaleString()}{suffix}
        </p>
      </div>
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="blob-1 w-72 h-72 top-10 -left-20"></div>
          <div className="blob-2 w-96 h-96 top-1/2 right-10"></div>
          <div className="blob-3 w-80 h-80 bottom-20 left-1/3"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 hero-pattern opacity-30"></div>
        
        <div className="container relative z-10 px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full shadow-lg">
                <Sparkles className="h-5 w-5 text-primary-600 animate-pulse" />
                <span className="font-semibold gradient-text">🎉 Welcome to the Future of Learning</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="heading-xl text-balance">
                Unlock Your{' '}
                <span className="gradient-text">Potential</span>{' '}
                with World-Class{' '}
                <span className="text-secondary-600">Education</span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl">
                Discover BalSampada – a fun, safe, and educational summer camp for kids aged 5 to 12. Join us for indoor and outdoor activities that spark creativity, fitness, and lifelong learning.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register/student"
                  className="btn btn-primary btn-lg group shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  <Rocket className="h-5 w-5" />
                  Start Learning Today
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/courses"
                  className="btn btn-outline btn-lg group glass"
                >
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 border-3 border-white flex items-center justify-center text-white font-bold shadow-lg">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-neutral-900">10,000+ Students</p>
                    <p className="text-sm text-neutral-600">Learning with us daily</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="ml-2">
                    <p className="font-bold text-neutral-900">4.9/5</p>
                    <p className="text-sm text-neutral-600">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative animate-slide-up">
              <div className="relative">
                {/* Main Hero Card */}
                <div className="glass rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover-lift">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl glow">
                      <GraduationCap className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold gradient-text mb-3">Premium Learning Experience</h3>
                    <p className="text-neutral-600 text-lg">Join the revolution in education</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { icon: Brain, label: "AI-Powered", color: "from-blue-500 to-cyan-500" },
                      { icon: Globe, label: "Global Access", color: "from-green-500 to-emerald-500" },
                      { icon: Award, label: "Certified", color: "from-purple-500 to-pink-500" },
                      { icon: Zap, label: "Fast Results", color: "from-orange-500 to-red-500" }
                    ].map((item, index) => (
                      <div key={index} className="feature-card p-6 text-center hover-lift">
                        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-3 shadow-xl`}>
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-bold text-neutral-900">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/register/student"
                    className="btn btn-primary w-full btn-lg group shadow-xl"
                  >
                    Get Started Now
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-r from-accent-400 to-accent-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float glow">
                  <Trophy className="h-14 w-14 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-r from-success to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                  <Star className="h-12 w-12 text-white fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="section-sm bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="heading-md text-white mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">See how we're transforming education and empowering students worldwide</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="relative">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} icon={stat.icon} />
                <p className="text-white/90 text-lg font-medium mt-2">{stat.label}</p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gradient-to-br from-neutral-50 to-primary-50/30 relative">
        <div className="absolute inset-0">
          <div className="blob-2 w-64 h-64 top-20 right-0 opacity-30"></div>
          <div className="blob-3 w-48 h-48 bottom-20 left-0 opacity-30"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge badge-primary mb-4">
              <Heart className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="heading-lg mb-6">
              Why Choose <span className="gradient-text">Tuition LMS</span>?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We provide a comprehensive learning experience with cutting-edge features designed to help you succeed in your academic journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-lg leading-relaxed">{feature.description}</p>
                
                <div className="mt-6 flex items-center text-primary-600 font-semibold group-hover:text-secondary-600 transition-colors">
                  Learn More
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge badge-secondary mb-4">
              <BookOpen className="h-4 w-4" />
              Popular Courses
            </div>
            <h2 className="heading-lg mb-6">
              Featured <span className="text-secondary-600">Courses</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Explore our most enrolled courses taught by expert educators with proven track records
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course, index) => (
              <div
                key={index}
                className="card card-hover group"
              >
                <div className="card-body">
                  {/* Course Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${course.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <course.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="badge badge-primary mb-4">{course.category}</div>
                  
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">{course.grade}</p>
                  
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-neutral-600">{course.rating}</span>
                    </div>
                  </div>
                  
                  {/* Course Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Duration:</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Lessons:</span>
                      <span className="font-semibold">{course.lessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Price:</span>
                      <span className="font-bold text-primary-600 text-lg">{course.price}</span>
                    </div>
                  </div>
                  
                  <Link
                    href="/courses"
                    className="btn btn-primary w-full group/btn"
                  >
                    Enroll Now
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gradient-to-br from-primary-50 to-secondary-50 relative">
        <div className="absolute inset-0 hero-pattern opacity-20"></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge badge-primary mb-4">
              <Rocket className="h-4 w-4" />
              Getting Started
            </div>
            <h2 className="heading-lg mb-6">
              How It <span className="text-primary-600">Works</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get started with your learning journey in just a few simple steps and transform your academic future
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Register",
                description: "Create your account as a student and complete your profile",
                icon: Users,
                color: "from-primary-500 to-primary-600"
              },
              {
                step: "2", 
                title: "Choose Courses",
                description: "Select subjects and classes that match your academic goals",
                icon: BookOpen,
                color: "from-secondary-500 to-secondary-600"
              },
              {
                step: "3",
                title: "Start Learning",
                description: "Attend live classes and access comprehensive study materials",
                icon: Video,
                color: "from-accent-500 to-accent-600"
              },
              {
                step: "4",
                title: "Track Progress",
                description: "Monitor your performance and achieve academic excellence",
                icon: Trophy,
                color: "from-success to-emerald-600"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`relative w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 glow-sm`}>
                  <item.icon className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-neutral-900">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge badge-secondary mb-4">
              <Quote className="h-4 w-4" />
              Testimonials
            </div>
            <h2 className="heading-lg mb-6">
              What Our <span className="text-secondary-600">Students</span> Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Hear success stories from our amazing community of learners and their parents
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card group hover-lift"
              >
                <div className="card-body">
                  {/* Quote Icon */}
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mb-6">
                    <Quote className="h-6 w-6 text-primary-600" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-neutral-700 mb-6 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-lg">{testimonial.name}</p>
                      <p className="text-neutral-600">{testimonial.role}</p>
                      <p className="text-sm text-neutral-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="blob-1 w-96 h-96 -top-20 -left-20 opacity-20"></div>
          <div className="blob-2 w-80 h-80 -bottom-10 -right-10 opacity-20"></div>
        </div>
        
        <div className="container text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Rocket className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="heading-lg text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students achieving their academic goals with our expert tutoring, 
              personalized learning paths, and comprehensive support system.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                href="/register/student"
                className="btn btn-lg bg-white text-primary-600 hover:bg-neutral-100 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Users className="h-5 w-5" />
                Register Now - It's Free!
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="btn btn-lg border-2 border-white text-white hover:bg-white/10 backdrop-blur transition-all duration-300"
              >
                <MessageSquare className="h-5 w-5" />
                Talk to Our Experts
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">✓</p>
                <p className="text-white/90">Free Trial</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">✓</p>
                <p className="text-white/90">Expert Support</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">✓</p>
                <p className="text-white/90">Money Back Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}