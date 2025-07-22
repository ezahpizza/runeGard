export const FAQBgElements = () => {
    return (
        <>
            {/* Grid background elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top-right grid */}
                <img 
                    src="/assets/layout/grid.svg" 
                    alt="" 
                    className="absolute -top-56 -right-48 w-[75%] h-[75%] opacity-80 transform rotate-45" 
                />
                {/* Bottom-left grid */}
                <img 
                    src="/assets/layout/grid.svg" 
                    alt="" 
                    className="absolute -bottom-24 -left-56 w-[70%] h-[70%] opacity-80 transform -rotate-45" 
                />
            </div>

            {/* Background image*/}
            <div className="absolute pt-12 top-1/2 left-1/4 transform -translate-y-1/2 w-full h-full pointer-events-none">
                <img 
                    src="/assets/layout/hexus.svg" 
                    alt="" 
                    className="w-full h-[40%] md:h-[80%] object-contain object-left"
                    style={{ zIndex: -1 }}
                />
            </div>
        </>
    );
}