import React from 'react';
import { Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from '#pages/Home.jsx';
import CaseStudy from '#pages/CaseStudy.jsx';
import NotFound from '#pages/NotFound.jsx';
import CommandPalette from '#components/CommandPalette.jsx';
import Toast from '#components/Toast.jsx';
import SmoothScroll from '#components/SmoothScroll.jsx';
import CustomCursor from '#components/CustomCursor.jsx';

gsap.registerPlugin(ScrollTrigger);

const App = () => (
    <>
        {/* Mounted once, outside <Routes>, so ⌘K and the easter-egg toast work
            identically on the home page and every case-study route. */}
        <SmoothScroll />
        <CustomCursor />
        <CommandPalette />
        <Toast />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services/:id" element={<CaseStudy />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </>
);

export default App;
