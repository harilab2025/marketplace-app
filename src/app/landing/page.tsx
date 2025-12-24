'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, Zap, Shield, Truck, CreditCard, Headphones,
    Star, TrendingUp, Users, Award, Check, ChevronDown, ChevronUp,
    ArrowRight, Sparkles, Package, Heart, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LandingPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
        }
    };

    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Experience blazing fast performance with optimized search and instant checkout.',
            color: 'text-yellow-600 bg-yellow-100',
        },
        {
            icon: Shield,
            title: 'Secure Payments',
            description: 'Your transactions are protected with bank-level encryption and security.',
            color: 'text-green-600 bg-green-100',
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Get your orders delivered within 2-3 business days with real-time tracking.',
            color: 'text-blue-600 bg-blue-100',
        },
        {
            icon: CreditCard,
            title: 'Flexible Payment',
            description: 'Multiple payment options including credit cards, bank transfer, and e-wallets.',
            color: 'text-purple-600 bg-purple-100',
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Round-the-clock customer support to help you with any questions or issues.',
            color: 'text-pink-600 bg-pink-100',
        },
        {
            icon: Award,
            title: 'Quality Guarantee',
            description: '100% authentic products with money-back guarantee and easy returns.',
            color: 'text-orange-600 bg-orange-100',
        },
    ];

    const stats = [
        { number: '100K+', label: 'Happy Customers', icon: Users },
        { number: '50K+', label: 'Products Sold', icon: Package },
        { number: '4.9/5', label: 'Customer Rating', icon: Star },
        { number: '99.9%', label: 'Satisfaction Rate', icon: Heart },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Verified Buyer',
            avatar: '👩',
            rating: 5,
            comment: 'Amazing shopping experience! The products arrived quickly and the quality exceeded my expectations. Highly recommended!',
        },
        {
            name: 'Michael Chen',
            role: 'Regular Customer',
            avatar: '👨',
            rating: 5,
            comment: 'Best online marketplace I\'ve used. Great prices, fast shipping, and excellent customer service. Will definitely shop again!',
        },
        {
            name: 'Emily Rodriguez',
            role: 'Premium Member',
            avatar: '👱‍♀️',
            rating: 5,
            comment: 'The search feature is incredibly helpful, and I love the suggestion system. Makes finding products so much easier!',
        },
    ];

    const faqs = [
        {
            question: 'How long does shipping take?',
            answer: 'Standard shipping typically takes 2-3 business days within the same region. Express shipping options are also available for faster delivery.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, JCB), bank transfers (BCA, Mandiri, BNI), and e-wallets (GoPay, OVO, Dana).',
        },
        {
            question: 'Can I return or exchange items?',
            answer: 'Yes! We offer a 30-day return policy for most items. Products must be unused and in original packaging. Contact our support team to initiate a return.',
        },
        {
            question: 'How do I track my order?',
            answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in the "My Orders" section of your account.',
        },
        {
            question: 'Is my personal information secure?',
            answer: 'Absolutely! We use bank-level encryption to protect your personal and payment information. We never share your data with third parties.',
        },
        {
            question: 'Do you offer bulk discounts?',
            answer: 'Yes, we offer special pricing for bulk orders. Contact our sales team for a custom quote based on your requirements.',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header/Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">MarketPlace</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                            <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
                            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => router.push('/login')}>
                                Sign In
                            </Button>
                            <Button onClick={() => router.push('/catalog')}>
                                Shop Now
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
                <div className="absolute inset-0 bg-grid-gray-900/[0.04] bg-size-[20px_20px]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6 animate-pulse">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">New Feature: AI-Powered Search</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Shop Smarter,
                                <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Live Better</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                                Discover thousands of premium products with intelligent search, instant checkout, and lightning-fast delivery. Your perfect shopping experience starts here.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    size="lg"
                                    onClick={() => router.push('/catalog')}
                                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Start Shopping
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-lg px-8 py-6"
                                >
                                    Learn More
                                </Button>
                            </div>
                            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                                <div className="flex -space-x-2">
                                    {['👨', '👩', '👱', '👴'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xl">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">100,000+</span> happy customers
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative aspect-square max-w-lg mx-auto">
                                <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-600 rounded-3xl transform rotate-6 opacity-20" />
                                <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                                    <div className="text-9xl">🛍️</div>
                                </div>
                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-bounce">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Check className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Order Confirmed</p>
                                            <p className="font-semibold">Premium Headphones</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Hot Deal</p>
                                            <p className="font-semibold text-blue-600">50% OFF</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                                    <stat.icon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Us?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We provide the best shopping experience with cutting-edge features and unmatched customer service.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-linear-to-br from-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            What Our Customers Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {`Don't just take our word for it. See what our satisfied customers have to say.`}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">{`"${testimonial.comment}"`}</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-linear-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of happy customers and discover your perfect products today.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => router.push('/catalog')}
                        className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                    >
                        Browse Catalog
                        <Search className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            {`Got questions? We've got answers.`}
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Stay in the Loop
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Subscribe to our newsletter for exclusive deals, new arrivals, and shopping tips.
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <Button type="submit" size="lg">
                                Subscribe
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            By subscribing, you agree to our Privacy Policy and consent to receive updates.
                        </p>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="h-6 w-6 text-blue-500" />
                                <span className="text-lg font-bold text-white">MarketPlace</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Your trusted marketplace for quality products and exceptional service.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © 2024 MarketPlace. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Facebook
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Twitter
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Instagram
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
