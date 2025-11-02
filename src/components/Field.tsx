interface Props {
    name: string;
    label: string;
    type?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export default function Field({
    name,
    label,
    type,
    defaultValue,
    onChange,
}: Props) {
    return (
        <label>
            <h3 className="ms-2 mb-1">{label}</h3>
            <input
                className="w-48 h-10 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-md"
                name={name}
                type={type}
                defaultValue={defaultValue}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </label>
    );
}
