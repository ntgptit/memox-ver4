/* MemoX — Reminders. States: on · off · time-picker
   Feature-local components: components/{TimeCol,TimePickerSheet}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxIconButton, MxCard, MxSwitch, MxChip } = NS;
const { TimePickerSheet } = window.MemoXReminder;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Reminder({ state = 'on' }) {
  const on = state !== 'off';
  const bar = <MxContextualAppBar variant="nested" title="Reminders" node="reminder/appbar" leading={<MxIconButton icon="arrow_back" node="reminder/back" />} />;

  const base = (
    <MxScaffold node="reminder/screen" appBar={bar}>
      <MxCard padding="sm">
        <window.ListRow icon="notifications" tone="warning" title="Study reminders" sub="Remind you to review every day" last node="reminder/toggle"
          trailing={<MxSwitch checked={on} onChange={() => {}} node="reminder/toggle-switch" />} />
      </MxCard>

      <MxCard interactive node="reminder/time" style={{ opacity: on ? 1 : 'var(--memox-opacity-half)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <window.SectionLabel style={{ margin: 0 }}>REMINDER TIME</window.SectionLabel>
            <div style={{ fontSize: 'var(--memox-font-size-3xl)', fontWeight: 'var(--memox-font-weight-extrabold)', letterSpacing: 'var(--memox-letter-spacing-tight)' }}>13:00</div>
          </div>
          <MxIconButton icon="schedule" node="reminder/time-edit" />
        </div>
      </MxCard>

      <div data-mx-node="reminder/days" style={{ opacity: on ? 1 : 'var(--memox-opacity-half)' }}>
        <window.SectionLabel style={{ margin: '0 0 var(--memox-space-2) var(--memox-space-1)' }}>REPEAT</window.SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--memox-space-2)', flexWrap: 'wrap' }}>
          {WEEKDAYS.map((d, i) => <MxChip key={d} label={d} selected={on} node={'reminder/day-' + i} />)}
        </div>
      </div>
    </MxScaffold>
  );

  if (state === 'time-picker') {
    return (
      <React.Fragment>
        {base}
        <TimePickerSheet />
      </React.Fragment>
    );
  }

  return base;
}

window.Reminder = Reminder;
})();
