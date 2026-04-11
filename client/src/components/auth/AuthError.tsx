interface Props {
    message: string;
}

export default function AuthError({message}: Props) {
    if (!message) return null;
    return (
        <div
            className="mb-6 px-4 py-3 text-sm font-light"
            style={{ color: '#ff6b6b', borderLeft: '2px solid rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.05)' }}
        >
            {message}
        </div>
    );    
}