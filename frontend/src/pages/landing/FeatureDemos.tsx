import {
  Building2,
  CircleAlert,
  CircleCheckBig,
  UsersRoundIcon,
  MoreHorizontal,
  Mail,
  Trash2,
  MessageCircle,
  Check,
} from "lucide-react";

export function AnalyticsDemo() {
  return (
    <div className="w-full flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-4">
      {/* Stat Card 1 */}
      <div className="bg-white rounded-tl-2xl border border-black/5 p-4 flex flex-col justify-between shadow-sm font-syne">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-charcoal-black/60">
            Total Units
          </span>
          <Building2 className="w-4 h-4 text-charcoal-black/40" />
        </div>
        <div className="text-2xl font-bricolage font-bold text-charcoal-black">
          124
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-white  rounded-tr-2xl border border-black/5 p-4 flex flex-col justify-between shadow-sm font-syne">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-charcoal-black/60">
            Total Tenants
          </span>
          <UsersRoundIcon className="w-4 h-4 text-charcoal-black/40" />
        </div>
        <div className="text-2xl font-bricolage font-bold text-charcoal-black">
          89
        </div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-white  rounded-bl-2xl border border-black/5 p-4 flex flex-col justify-between shadow-sm font-syne">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-charcoal-black/60">
            Collected
          </span>
          <CircleCheckBig className="w-4 h-4 text-green-500" />
        </div>
        <div className="text-2xl font-bricolage font-bold text-charcoal-black">
          RWF 4.2M
        </div>
      </div>

      {/* Stat Card 4 */}
      <div className="bg-white  rounded-br-2xl border border-black/5 p-4 flex flex-col justify-between shadow-sm font-syne">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-medium text-charcoal-black/60">
            Overdue
          </span>
          <CircleAlert className="w-4 h-4 text-destructive" />
        </div>
        <div className="text-2xl font-bricolage font-bold text-charcoal-black">
          RWF 450K
        </div>
      </div>
    </div>
  );
}

export function TicketDemo() {
  return (
    <div className="w-full flex-1 p-6 flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-syne overflow-hidden">
        <div className="p-5 flex flex-col gap-1 border-b border-black/5">
          <div className="flex justify-between items-center">
            <h3 className="font-bricolage font-semibold text-lg text-charcoal-black">
              Door 11
            </h3>
            <span className="text-xs text-charcoal-black/50">Oct 24</span>
          </div>
          <span className="text-sm text-charcoal-black/60">John Doe</span>
        </div>

        <div className="p-5">
          <p className="text-sm text-charcoal-black/80 line-clamp-1">
            There has been a power outage in the building.
          </p>
        </div>

        <div className="p-5 pt-0">
          <button className="w-full py-2.5 rounded-lg border border-black/10 flex items-center justify-center gap-2 text-sm font-medium text-charcoal-black hover:bg-black/5 transition-colors">
            <Check className="w-4 h-4" /> Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenantsDemo() {
  const tenants = [
    {
      name: "John Doe",
      unit: "Door 1A",
      amount: "RWF 450,000",
      status: "Paid",
      overdue: false,
    },
    {
      name: "Jane Smith",
      unit: "Room 4B",
      amount: "RWF 320,000",
      status: "Paid",
      overdue: false,
    },
    {
      name: "Adam Smith",
      unit: "VIP 2C",
      amount: "RWF 550,000",
      status: "Overdue",
      overdue: true,
    },
    {
      name: "Mary Jane",
      unit: "Penthouse",
      amount: "RWF 1,200,000",
      status: "Paid",
      overdue: false,
    },
  ];

  return (
    <div className="w-full h-full p-4 flex flex-col overflow-hidden font-syne">
      <div className="w-full bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 font-medium border-b border-black/5 text-xs text-charcoal-black/60 uppercase">
          <div className="col-span-4">Tenant Name</div>
          <div className="col-span-3">Unit Name</div>
          <div className="col-span-3">Tenant Amount</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-black/5">
          {tenants.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
            >
              <div className="col-span-4 font-medium text-sm text-charcoal-black">
                {t.name}
              </div>
              <div className="col-span-3 text-sm text-charcoal-black/70">
                {t.unit}
              </div>
              <div className="col-span-3 text-sm text-charcoal-black/70">
                {t.amount}
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-sm text-[0.65rem] uppercase ${
                    t.overdue
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-success/10 text-success border border-success/20"
                  }`}
                >
                  {t.status}
                </span>
                <MoreHorizontal className="w-4 h-4 text-charcoal-black/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommunicationsDemo() {
  return (
    <div className="w-full flex-1 p-6 flex flex-col items-center justify-center relative h-full overflow-hidden">
      <div className="w-full bg-white rounded-xl border border-black/5 shadow-sm flex flex-col font-syne max-w-sm absolute -rotate-3 scale-95 opacity-50 translate-y-[-10px] translate-x-[15px]" />

      <div className="w-full bg-white rounded-2xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col font-syne max-w-sm relative z-10 rotate-2">
        <div className="p-5 flex items-center gap-3 border-b border-black/5">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-acres-blue">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bricolage font-semibold text-lg text-charcoal-black">
            Water Shutoff Notice
          </h3>
        </div>

        <div className="p-5 border-b border-black/5">
          <p className="text-sm text-charcoal-black/70 leading-relaxed line-clamp-3">
            Dear tenants, pleased be advised that water will be temporarily shut
            off in the building for emergency maintenance on Thursday from 10 AM
            to 2 PM. We apologize for the inconvenience.
          </p>
        </div>

        <div className="px-5 py-3 flex justify-between items-center bg-slate-50 rounded-b-2xl">
          <button className="text-xs font-semibold text-acres-blue hover:text-acres-blue/80 flex items-center gap-1.5 transition-colors">
            <Mail className="w-3.5 h-3.5" /> Send Broadcast
          </button>
          <button className="text-charcoal-black/40 hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
