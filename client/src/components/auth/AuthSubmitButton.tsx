interface Props {
    loading: boolean;
    label: string;
    loadingLabel: string;
}

export default function AuthSubmitButton({ loading, label, loadingLabel }: Props) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="text-white text-sm tracking-widest w-full px-9 py-3 cursor-pointer transition-all hover:-translate-y-px mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#6c63ff', border: 'none', borderRadius: '2px' }}
        >
            {loading ? loadingLabel : label}
        </button>
    );
}