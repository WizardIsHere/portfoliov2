import React from 'react';
import Nav from '#components/Nav.jsx';
import Hero from '#components/Hero.jsx';
import KpiStrip from '#components/KpiStrip.jsx';
import Services from '#components/Services.jsx';
import StackMap from '#components/StackMap.jsx';
import Changelog from '#components/Changelog.jsx';
import LiveActivity from '#components/LiveActivity.jsx';
import Contact from '#components/Contact.jsx';
import Footer from '#components/Footer.jsx';
import RecruiterSummary from '#components/RecruiterSummary.jsx';
import useViewModeStore from '#store/viewMode.js';

const Home = () => {
    const recruiterMode = useViewModeStore((s) => s.recruiterMode);

    return (
        <>
            <Nav />
            <main>
                {recruiterMode ? (
                    <RecruiterSummary />
                ) : (
                    <>
                        <Hero />
                        <KpiStrip />
                        <Services />
                        <StackMap />
                        <Changelog />
                        <LiveActivity />
                        <Contact />
                    </>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Home;
