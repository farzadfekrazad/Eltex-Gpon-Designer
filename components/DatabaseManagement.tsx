
import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { authService } from '../auth/authService';

interface DbStatus {
    type: string;
    status: string;
}

const DatabaseManagement: React.FC = () => {
    const { t } = useI18n();
    const [status, setStatus] = useState<DbStatus | null>(null);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [resetConfirmText, setResetConfirmText] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/settings/db-status', { headers: authService.getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (error) {
                console.error("Failed to fetch DB status", error);
            }
        };
        fetchStatus();
    }, []);

    const handleBackup = async () => {
        setIsBackupLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings/db-backup', {
                method: 'POST',
                headers: authService.getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Backup failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `pol_designer_backup_${timestamp}.db`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setMessage({ type: 'success', text: t('database.backupSuccess') });
        } catch (error) {
            setMessage({ type: 'error', text: t('database.backupError') });
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleReset = async () => {
        setIsResetLoading(true);
        setMessage(null);
        try {
             const res = await fetch('/api/settings/db-reset', {
                method: 'POST',
                headers: authService.getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Reset failed');
            setMessage({ type: 'success', text: t('database.resetSuccess') });
            setTimeout(() => {
                authService.logout();
                window.location.href = '/';
            }, 2000);
        } catch (error) {
             setMessage({ type: 'error', text: t('database.resetError') });
             setIsResetLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">{t('database.title')}</h2>
            <p className="text-sm text-gray-400 mb-6">{t('database.description')}</p>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
                    <span className="font-semibold text-gray-300">{t('database.status')}</span>
                    {status ? (
                        <span className="font-mono text-green-400 bg-green-900/50 px-3 py-1 rounded-full text-sm">
                            {status.type} - {t('database.statusConnected')}
                        </span>
                    ) : (
                        <span className="font-mono text-gray-500">{t('app.loading')}</span>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                     <button onClick={handleBackup} disabled={isBackupLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-wait">
                        {isBackupLoading ? t('app.loading') : t('database.backup')}
                    </button>
                </div>

                <div className="!mt-8 p-4 border-2 border-red-500/50 bg-red-900/20 rounded-lg space-y-3">
                    <h3 className="text-lg font-bold text-red-400">{t('database.reset')}</h3>
                    <p className="text-sm text-red-300">{t('database.resetWarning')}</p>
                    <p className="text-sm text-gray-300">{t('database.resetConfirmPrompt')}</p>
                    <input 
                        type="text"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white font-mono"
                        placeholder="RESET"
                    />
                    <button 
                        onClick={handleReset} 
                        disabled={resetConfirmText !== 'RESET' || isResetLoading} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isResetLoading ? t('app.loading') : t('database.confirm')}
                    </button>
                </div>
            </div>

            {message && (
                 <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {message.text}
                 </div>
            )}
        </div>
    );
};

export default DatabaseManagement;
