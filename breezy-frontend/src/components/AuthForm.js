"use client";
import { useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";

export default function AuthForm({ fields, onSubmit, submitLabel }) {
    const [values, setValues] = useState({});

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <form id="auth-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ name, label, type }) => (
                <div key={name} className="flex flex-col">
                    <input
                        id={name}
                        name={name}
                        type={type}
                        placeholder={label}
                        onChange={handleChange}
                        style={{ backgroundColor: "var(--input)" }}
                        className="rounded-xl px-4 py-4"
                        required
                    />
                </div>
            ))}
            <PrimaryButton type="submit">
                {submitLabel || "Valider"}
            </PrimaryButton>
        </form>
    );
}