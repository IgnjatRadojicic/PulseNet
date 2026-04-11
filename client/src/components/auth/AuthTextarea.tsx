interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
}

export default function AuthTextarea({ label, value, onChange, placeholder, optional }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-muted-ghost" style={{ letterSpacing: '0.15em' }}>
                {label}
                {optional && <span className="normal-case text-muted-whisper ml-1">(optional)</span>}
            </label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-white text-sm font-light px-4 py-3 outline-none transition-colors border border-border-subtle rounded-half focus:border-pulse-half resize-none h-20"
            />
        </div>
    );
}