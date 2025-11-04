// src/components/Loader.jsx
const Loader = ({ size = 'medium', fullScreen = false }) => {
    const sizes = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const loader = (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                {loader}
            </div>
        );
    }

    return loader;
};

export default Loader;