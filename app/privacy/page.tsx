import type { Metadata } from 'next';
import Navbar3D from '@/app/components/Navbar3D';

export const metadata: Metadata = {
    title: 'Privacy Policy - BillGST',
    description: 'Privacy Policy for BillGST - Free GST Billing Software',
};

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar3D />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 pb-16 px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px) + 1.5rem)' }}>
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-5 sm:p-8 md:p-12 border border-slate-200/80">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-6 sm:mb-8 text-center tracking-tight">Privacy Policy</h1>

                    <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                        <section>
                            <p className="text-sm text-gray-500 mb-6">
                                <strong>Last Updated:</strong> January 11, 2026
                            </p>
                            <p className="mb-4">
                                Welcome to BillGST (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our GST billing and inventory management software.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>

                            <h3 className="text-xl font-medium text-gray-800 mb-3">1.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Account Information:</strong> Name, email address, phone number, and business details when you register</li>
                                <li><strong>Business Data:</strong> GST number, business name, address, and other business-related information</li>
                                <li><strong>Transaction Data:</strong> Invoice details, customer information, product/service information, and payment records</li>
                                <li><strong>Store Configuration:</strong> UPI details, bank information, and business settings</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mb-3">1.2 Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Usage Data:</strong> Information about how you use our application</li>
                                <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address</li>
                                <li><strong>Cookies and Similar Technologies:</strong> To enhance user experience and analyze usage patterns</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="mb-3">We use the collected information for:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Providing and maintaining our billing and inventory management services</li>
                                <li>Processing transactions and generating invoices</li>
                                <li>Sending important notifications about your account and transactions</li>
                                <li>Improving and optimizing our application&apos;s functionality</li>
                                <li>Providing customer support and responding to your inquiries</li>
                                <li>Ensuring compliance with GST regulations and tax laws</li>
                                <li>Detecting and preventing fraud or unauthorized access</li>
                                <li>Analyzing usage patterns to enhance user experience</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
                            <p className="mb-4">
                                We implement industry-standard security measures to protect your data:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Local Storage:</strong> Your business data is primarily stored locally on your device for offline access</li>
                                <li><strong>Cloud Backup:</strong> Optional cloud synchronization for data backup and multi-device access</li>
                                <li><strong>Encryption:</strong> Data transmission is encrypted using secure protocols (HTTPS/SSL)</li>
                                <li><strong>Authentication:</strong> Secure login systems to prevent unauthorized access</li>
                                <li><strong>Regular Updates:</strong> We regularly update our security measures to address emerging threats</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                            <p className="mb-4">
                                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our application (e.g., hosting services, email delivery)</li>
                                <li><strong>Legal Compliance:</strong> When required by law, court order, or governmental regulations</li>
                                <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
                                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Data Rights</h2>
                            <p className="mb-3">You have the following rights regarding your data:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Access:</strong> Request access to your personal data</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                                <li><strong>Export:</strong> Export your business data in a portable format</li>
                                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                <li><strong>Data Portability:</strong> Transfer your data to another service provider</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                            <p className="mb-4">
                                We use cookies and similar tracking technologies to enhance your experience. These include:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Essential Cookies:</strong> Required for basic functionality and authentication</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our application</li>
                            </ul>
                            <p className="mb-4">
                                You can control cookie preferences through your browser settings, but disabling certain cookies may limit functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
                            <p className="mb-4">
                                Our application may integrate with third-party services for enhanced functionality:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Payment gateways for UPI and other payment processing</li>
                                <li>Email services for sending invoices and notifications</li>
                                <li>WhatsApp Business API for customer communication</li>
                                <li>Analytics services to improve our application</li>
                            </ul>
                            <p className="mb-4">
                                These third parties have their own privacy policies, and we recommend reviewing them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
                            <p className="mb-4">
                                BillGST is designed for business use and is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete such information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
                            <p className="mb-4">
                                We retain your data for as long as necessary to provide our services and comply with legal obligations:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Active Accounts:</strong> Data is retained while your account is active</li>
                                <li><strong>Tax Compliance:</strong> Transaction records may be retained for up to 7 years as required by Indian tax laws</li>
                                <li><strong>Deleted Accounts:</strong> Upon account deletion, we remove personal data within 90 days, except where legal retention is required</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
                            <p className="mb-4">
                                Your data is primarily stored within India. If data is transferred internationally, we ensure appropriate safeguards are in place to protect your information in accordance with Indian data protection laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Updates to This Policy</h2>
                            <p className="mb-4">
                                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes through:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>In-app notifications</li>
                                <li>Email notifications to registered users</li>
                                <li>Updates on our website with the &quot;Last Updated&quot; date</li>
                            </ul>
                            <p className="mb-4">
                                Continued use of BillGST after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                            <p className="mb-4">
                                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <p className="mb-2"><strong>BillGST Support</strong></p>
                                <p className="mb-2">Email: <a href="mailto:billgstapp@gmail.com" className="text-blue-600 hover:text-blue-800 underline">billgstapp@gmail.com</a></p>
                                <p className="mb-2">Website: <a href="https://billgst.in" className="text-blue-600 hover:text-blue-800 underline">https://billgst.in</a></p>
                                <p className="mb-2">Address: India</p>
                            </div>
                        </section>

                        <section className="mt-8 pt-6 border-t border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Consent</h2>
                            <p className="mb-4">
                                By using BillGST, you consent to the collection, use, and processing of your information as described in this Privacy Policy. If you do not agree with this policy, please discontinue use of our application.
                            </p>
                        </section>

                        <section className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Privacy Matters</h3>
                            <p className="text-gray-700">
                                We are committed to transparency and protecting your privacy. This policy is designed to help you understand how we handle your data responsibly. If you have any questions or need clarification on any aspect of this policy, we&apos;re here to help.
                            </p>
                        </section>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            © 2026 BillGST. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
