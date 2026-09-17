import { useState } from 'react';

export function useValidatedField(initialError, validate) {
    const [value, setValue] = useState('');
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(initialError);

    const onChange = (e) => {
        const next = e.target.value;
        setValue(next);
        setError(validate(next));
    };

    const onBlur = () => setDirty(true);

    return { value, dirty, error, onChange, onBlur };
}
