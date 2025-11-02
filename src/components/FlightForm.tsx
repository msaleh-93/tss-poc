import { useChildMatches, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import Button from "./Button";
import Field from "./Field";

export default function FlightForm() {
    const navigate = useNavigate();
    const search = useChildMatches()[0].search;
    const { from, to, date } = "from" in search ? search : {};
    const { t } = useTranslation();

    return (
        <form
            className="flex gap-5 items-end"
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const date = formData.get("date");
                navigate({
                    to: "/flights",
                    search: {
                        from: `${formData.get("from")}`,
                        to: `${formData.get("to")}`,
                        date: date ? `${date}` : undefined,
                    },
                });
            }}
            onReset={() => {
                navigate({ to: "/" });
            }}
        >
            <Field label={t("from")} name="from" defaultValue={from} />
            <Field label={t("to")} name="to" defaultValue={to} />
            <Field
                label={t("date")}
                name="date"
                type="date"
                defaultValue={date}
            />
            <Button label={t("search")} />
            <Button label={t("clear")} type="reset" outlined />
        </form>
    );
}
