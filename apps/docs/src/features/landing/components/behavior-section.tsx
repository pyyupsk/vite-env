import { Link } from "wouter";
import { Section } from "./section";

const CASES = [
  {
    when: "A required variable is missing or has the wrong format",
    result: "The build stops and lists each bad variable.",
    href: "/docs/configuration",
    label: "Configuration",
  },
  {
    when: "Client code imports virtual:env/server",
    result: "The build fails. You can switch this to a warning or a stub.",
    href: "/docs/guard-modes",
    label: "Guard modes",
  },
  {
    when: "A server value ends up in a client chunk",
    result: "The build fails and names the variable and the file.",
    href: "/docs/server-leak",
    label: "Server leak detection",
  },
  {
    when: "Every value is valid",
    result: "Your code gets two frozen env objects, and vite-env.d.ts is updated.",
    href: "/docs/virtual-modules",
    label: "Virtual modules",
  },
];

export function BehaviorSection() {
  return (
    <Section
      id="behavior"
      title="What happens on build"
      intro="vite-env fails early and loudly, so a bad env never reaches production."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[16px]">
          <thead className="border-b border-rule-strong">
            <tr>
              <th scope="col" className="w-1/2 py-2 pr-6 text-left text-[14px] font-semibold">
                When
              </th>
              <th scope="col" className="py-2 text-left text-[14px] font-semibold">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c) => (
              <tr key={c.when} className="border-b border-rule align-top">
                <th scope="row" className="py-4 pr-6 text-left font-normal">
                  {c.when}
                </th>
                <td className="py-4 text-ink-2">
                  {c.result}{" "}
                  <Link
                    href={c.href}
                    className="whitespace-nowrap text-link underline decoration-current/35 underline-offset-[3px] hover:decoration-current"
                  >
                    See {c.label}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
