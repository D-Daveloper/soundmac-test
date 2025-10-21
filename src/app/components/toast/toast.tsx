/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { TOAST, TOAST_CONTAINER } from './types';
import { styles } from './constants';



const Toast = ({ toast, onClose }: TOAST) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                handleClose();
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className={styles.icon} />;
            case 'error':
                return <AlertCircle className={styles.icon} />;
            case 'warning':
                return <AlertTriangle className={styles.icon} />;
            case 'info':
                return <Info className={styles.icon} />;
            default:
                return <Info className={styles.icon} />;
        }
    };

    const getTypeClass = () => {
        switch (toast.type) {
            case 'success':
                return styles.toastSuccess;
            case 'error':
                return styles.toastError;
            case 'warning':
                return styles.toastWarning;
            case 'info':
                return styles.toastInfo;
            default:
                return styles.toastInfo;
        }
    };

    return (
        <div
            className={`${styles.toast} ${getTypeClass()} ${isVisible && !isExiting ? styles.toastVisible : ''
                } ${isExiting ? styles.toastExiting : ''}`}
        >
            <div className={styles.iconContainer}>
                {getIcon()}
            </div>
            <div className={styles.content}>
                {toast.title && (
                    <div className={styles.title}>{toast.title}</div>
                )}
                <div className={styles.message}>{toast.message}</div>
            </div>
            <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close notification"
            >
                <X className={styles.closeIcon} />
            </button>
            {toast.duration && (
                <div
                    className={styles.progressBar}
                    style={{
                        ['--duration' as string]: `${toast.duration}ms`,
                    }}
                />
            )}
        </div>
    );
};

const ToastContainer2 = (params: TOAST_CONTAINER) => {
    if (params?.toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {params?.toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={params?.onRemoveToast}
                />
            ))}
        </div>
    );
};

// const ToastDemo = () => {
//     const [toasts, setToasts] = useState([]);

//     const addToast = (type, title, message, duration = 5000) => {
//         const newToast = {
//             id: Date.now() + Math.random(),
//             type,
//             title,
//             message,
//             duration
//         };

//         setToasts(prev => [...prev, newToast]);
//     };

//     const removeToast = (id) => {
//         setToasts(prev => prev.filter(toast => toast.id !== id));
//     };

//     return (
//         <>
//             <style>{cssStyles}</style>
//             <div className={styles.demoContainer}>
//                 <div className={styles.demoCard}>
//                     <h1 className={styles.demoTitle}>Beautiful Toast Notifications</h1>
//                     <p className={styles.demoSubtitle}>
//                         Stunning notifications with glassmorphism effects and smooth animations
//                     </p>
//                     <div className={styles.buttonGroup}>
//                         <button
//                             className={`${styles.demoButton} ${styles.successButton}`}
//                             onClick={() => addToast(
//                                 'success',
//                                 'Success!',
//                                 'Your action was completed successfully.'
//                             )}
//                         >
//                             Success Toast
//                         </button>
//                         <button
//                             className={`${styles.demoButton} ${styles.errorButton}`}
//                             onClick={() => addToast(
//                                 'error',
//                                 'Error!',
//                                 'Something went wrong. Please try again.'
//                             )}
//                         >
//                             Error Toast
//                         </button>
//                         <button
//                             className={`${styles.demoButton} ${styles.warningButton}`}
//                             onClick={() => addToast(
//                                 'warning',
//                                 'Warning!',
//                                 'Please review your input before proceeding.'
//                             )}
//                         >
//                             Warning Toast
//                         </button>
//                         <button
//                             className={`${styles.demoButton} ${styles.infoButton}`}
//                             onClick={() => addToast(
//                                 'info',
//                                 'Info',
//                                 'Here\'s some useful information for you.'
//                             )}
//                         >
//                             Info Toast
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
//         </>
//     );
// };

export default ToastContainer2;