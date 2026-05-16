import { Button, Image, Input } from 'antd';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { scrollToSection } from './utils/functions';
import { useNavigate } from 'react-router';
import LogoHeader from '../../components/LogoHeader';
import { SECTIONS, sectionsData } from './utils/constants';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { ArrowUpRight } from 'lucide-react';

export const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleScroll = () => {
        if (window.scrollY > 30) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
    }, []);

    const sectionKeys = Object.values(SECTIONS);
    const activeSection = useScrollSpy(sectionKeys, 100);

    return (
        <div className="bg-greenhouse-background">
              <div
                    className="absolute inset-0 z-0"
                    style={{
                    backgroundImage: `
                        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 30px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
                    maskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
                    }}
                />


            <div
                className={classNames(
                    'fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-greenhouse-background',
                    {
                        'shadow-md': isScrolled,
                    }
                )}
            >
                <div className="relative max-w-screen-xl mx-auto h-full flex justify-between lg:grid lg:grid-cols-4 p-4 px-6 xl:px-0">
                    <div className='col-span-1'>
                        <LogoHeader size="large" />
                    </div>
                    <div className="hidden lg:flex gap-6 col-span-2 justify-center items-center">
                        {sectionsData.map((item) => (
                            <div
                                key={item.key}
                                onClick={() => scrollToSection(item.key)}
                                className={classNames("rounded-md cursor-pointer text-gray-800 font-medium hover:text-greenhouse-dark p-2", {
                                    "text-greenhouse-dark": activeSection === item.key
                                })}>{item.name}</div>
                        ))}
                    </div>

                    <div className="hidden lg:flex gap-6 col-span-1 justify-end items-center">
                        <div className="rounded-4xl cursor-pointer text-gray-800 font-medium p-2 px-4 border border-gray-800 hover:border-greenhouse-dark hover:text-greenhouse-primary hover:bg-greenhouse-light"  onClick={() => navigate('/auth/signin', { replace: true })}>Sign In Now</div>
                    </div>

                    <div className="lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <svg className="w-6 h-6 text-inkblue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    className={classNames(
                        'lg:hidden absolute w-full bg-greenhouse-background shadow-md px-6 pb-4 transition-all duration-300 ease-in-out overflow-hidden',
                        isMobileMenuOpen
                            ? 'max-h-96 opacity-100 translate-y-0'
                            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                    )}
                >
                    <div className="flex flex-col gap-4 py-4">
                        {sectionsData.map((item) => (
                            <div key={item.key} onClick={() => scrollToSection(item.key)} className={classNames("text-gray-700 font-medium cursor-pointer hover:text-inkblue-400", {
                                "text-inkblue-400": activeSection === item.key
                            })}>{item.name}</div>
                        ))}
                        <div className="text-gray-700 font-medium hover:text-inkblue-400 cursor-pointer">Sign in</div>
                    </div>
                </div>
            </div>

            <div className="pt-20 min-h-screen relative overflow-hidden">
                <div className="relative z-10">
                    <div id={SECTIONS.HOME}>
                        <div
                            className={classNames(
                                "relative flex flex-col overflow-hidden max-w-screen-xl mx-auto justify-center items-center",
                                "py-20",          
                                "lg:h-[calc(100vh-75px)] lg:py-0", 
                                "[@media(min-width:1920px)]:h-full [@media(min-width:1920px)]:py-20"    
                            )}
                            >
                            <div className="flex h-full z-10 gap-4 items-center px-6 xl:px-0"> 
                                <div className="w-full md:w-4/5 lg:w-1/2 pr-6">
                                    <span className='text-4xl sm:text-5xl md:text-6xl font-semibold py-10 md:py-14'><span className='text-greenhouse-primary'>Smart greenhouse</span> monitoring for better harvests</span>
                                    <div className='pt-4'>Smart greenhouse monitoring applies sensors and automation to track temperature, humidity, soil moisture, and light. This real-time data helps farmers optimize conditions, save resources, and achieve better harvests.</div>
                                    <div className='pt-6 flex gap-4'>
                                        <Button
                                            type="primary"
                                            className="!h-12 !px-6 !rounded-4xl !font-semibold !bg-greenhouse-primary !text-white hover:!bg-greenhouse-dark flex items-center gap-2"
                                            onClick={() => navigate('/auth/signin', { replace: true })}
                                        >
                                            Get Started
                                            <ArrowUpRight />
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-1/2 hidden lg:block">
                                    <Image
                                        src='/right-hero.png'
                                        alt='Right Hero'
         
                                        preview={false}
                                        className="w-full h-full object-cover object-center rounded-2xl shadow-lg"
                                    />  
                                </div>
                            </div>
                        </div>
                    </div>


                    <div
                        id={SECTIONS.OUR_IMPACT}
                        className='max-w-screen-xl mx-auto bg-greenhouse-background py-16 grid grid-cols-1 gap-10 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200'
                    >
                        <div className='px-10 pb-6 sm:pb-0'>
                            <div className='text-4xl font-semibold'>5+</div>
                            <div className='pt-2'>Year of Experience</div>
                        </div>
                        <div className='px-10 pb-6 sm:pb-0'>
                            <div className='text-4xl font-semibold'>10+</div>
                            <div className='pt-2'>Successful Projects</div>
                        </div>
                        <div className='px-10 pb-6 sm:pb-0'>
                            <div className='text-4xl font-semibold'>100+</div>
                            <div className='pt-2'>Farmers Engaged</div>
                        </div>
                        <div className='px-10 pb-6 sm:pb-0'>
                            <div className='text-4xl font-semibold'>20+</div>
                            <div className='pt-2'>Strategic Partnerships</div>
                        </div>
                    </div>

                    <div
                        id={SECTIONS.SOLUTIONS}
                        className='max-w-screen-xl mx-auto bg-greenhouse-background border-t border-gray-200 py-12'
                    >
                        <div className='px-4 flex flex-col md:flex-row md:justify-between gap-6 md:gap-10'>
                            <div className='w-full md:w-2/5 text-2xl md:text-3xl font-medium'>
                                Smart Greenhouse Solution for Sustainable Farming
                            </div>

                            <div className='w-full md:w-2/5'>
                                We provide advanced monitoring and control systems that help farmers optimize greenhouse environments, reduce costs, and achieve higher, more sustainable harvests.
                            </div>
                        </div>
                        <div className='pt-16 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-6'>
                            <div>
                                <Image
                                    src='/sensor-system.jpg'
                                    alt='Sensor System'
                                    height={480}
                                    preview={false}
                                    className="w-full h-full object-cover object-left rounded-2xl shadow-lg"
                                />
                                <div className='flex justify-end pt-2 font-semibold'>Sensor System</div>
                            </div>

                            <div className='lg:pt-28'>
                                <Image
                                    src='/real-time-monitoring.jpg'
                                    alt='Real Time Monitoring'
                                    height={480}
                                    preview={false}
                                    className="w-full h-full object-cover object-left rounded-2xl shadow-lg"
                                />
                                <div className='flex justify-end pt-2 font-semibold'>Real Time Monitoring</div>
                            </div>

                            <div>
                                <Image
                                    src='/automated-irrigation.jpg'
                                    alt='Automated Irrigation'
                                    height={480}
                                    preview={false}
                                    className="w-full h-full object-cover object-center rounded-2xl shadow-lg"
                                />
                                <div className='flex justify-end pt-2 font-semibold'>Automated Irrigation</div>
                            </div>

                            <div className='lg:pt-28'>
                                <Image
                                    src='/healthy-crops.jpg'
                                    alt='Healthy Crops'
                                    height={480}
                                    preview={false}
                                    className="w-full h-full object-cover object-center rounded-2xl shadow-lg"
                                />
                                <div className='flex justify-end pt-2 font-semibold'>Healthy Crops</div>
                            </div>
                        </div>
                    </div>

                    <div className='px-4 xl:px-0' id={SECTIONS.COLLABORATE}>
                        <div
                            className='max-w-screen-xl mx-auto py-12 h-72 sm:h-[700px] rounded-2xl bg-no-repeat bg-cover bg-center my-20'
                            style={{ backgroundImage: 'url(/2736.jpg)' }}
                        >
                            <div className='h-full flex flex-col justify-between'>
                                <div className='max-w-2xl text-2xl sm:text-4xl px-16 text-white'>
                                    Collaborate and Learn from Greenhouse Experts and Enthusiasts
                                </div>
                                <div className='flex justify-between px-16'>
                                    <div className='text-white max-w-2xl hidden sm:block'>
                                        Join a dedicated community where growers, researchers, and agri-tech specialists share knowledge, exchange experiences, and explore innovations to build smarter and more sustainable greenhouses.
                                    </div>
                                    <Button
                                        type="primary"
                                        className="!h-12 !px-6 !rounded-4xl !font-semibold !bg-white !text-black hover:!bg-gray-100 flex items-center gap-2"
                                        onClick={() => navigate('/auth/signin', { replace: true })}
                                    >
                                        Get Started
                                        <ArrowUpRight />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className='max-w-screen-xl mx-auto bg-greenhouse-background py-12'
                        id={SECTIONS.BENEFITS}
                    >
                        <div className='px-4 flex flex-col md:flex-row md:justify-between gap-6 md:gap-10'>
                            <div className='w-full md:w-2/5 text-2xl md:text-3xl font-medium'>
                                Smart greenhouse brings many benefits to modern farming
                            </div>

                            <div className='w-full md:w-2/5'>
                                By combining advanced monitoring, automation, and sustainable practices, it creates the ideal environment for crops to thrive
                            </div>
                        </div>
                        <div className='pt-16 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-6'>
                            <div>
                               <div className="w-full h-64 sm:h-80 md:h-[500px] overflow-hidden rounded-2xl shadow-lg flex flex-col justify-center">
                                    <Image
                                        src="/greater-efficiency.jpg"
                                        alt="Greater Efficiency"
                                        preview={false}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className='text-2xl pt-2'>Greater Efficiency</div>
                                <div className='pt-3 text-gray-600'>
                                    The smart greenhouse automatically adjusts light, temperature, humidity, and irrigation, optimizing resources and lowering operational costs.
                                </div>
                            </div>

                            <div>
                                <Image
                                    src='/higher-crop.jpg'
                                    alt='Higher Crop Yields'
                                    height={300}
                                    preview={false}
                                    className="w-full h-full object-cover object-center rounded-2xl shadow-lg"
                                />
                                <div className='text-2xl pt-2'>Higher Crop Yields</div>
                                <div className='pt-3 text-gray-600'>
                                    Real-time monitoring and precise environmental control provide ideal conditions for crops, resulting in healthier plants and more abundant harvests.
                                </div>
                            </div>

                            <div>
                                <Image
                                    src='/sustainable-farming.jpg'
                                    alt='Sustainable Farming'
                                    height={500}
                                    preview={false}
                                    className="w-full h-full object-cover object-center rounded-2xl shadow-lg"
                                />
                                <div className='text-2xl pt-2'>Sustainable Farming</div>
                                <div className='pt-3 text-gray-600'>
                                    Smart greenhouse practices reduce waste and protect natural resources, ensuring long-term productivity while promoting a greener future.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className='max-w-screen-xl mx-auto py-3 sm:py-12 h-72 sm:h-[570px] bg-no-repeat bg-cover bg-center my-20'
                        style={{ backgroundImage: 'url(/background-contact.avif)' }}
                    >
                        <div className='h-full flex flex-col justify-center items-center'>
                            <div className='max-w-4/5 sm:max-w-1/2 text-white text-2xl sm:text-5xl text-center'>Join the Smart Greenhouse Revolution Today!</div>
                            <div className='pt-6 flex gap-4 px-4'>
                                <Input
                                    placeholder="Enter your email"
                                    className="!h-12 !max-w-72 !rounded-4xl !px-6 !border-none"
                                />
                                <Button
                                    type="primary"
                                    className="!rounded-4xl !h-12 !px-6 !font-semibold !bg-gray-900 !text-white hover:!bg-gray-500 flex items-center gap-2 !border-none"
                                >
                                    Subscribe
                                    <ArrowUpRight />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div id='footer' className='max-w-screen-xl mx-auto py-10 text-gray-500 px-8 xl:px-0'>
                        <div className='flex flex-col md:flex-row justify-between gap-4'>
                            <div className='flex gap-2 md:gap-4'>
                                <div>© 2025 Smart Greenhouse</div>
                                <div className='cursor-pointer hover:underline'>Privacy and Terms</div>
                            </div>
                            <div className='flex gap-2 md:gap-4'>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
