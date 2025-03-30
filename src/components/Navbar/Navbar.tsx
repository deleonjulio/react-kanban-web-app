import { useState } from 'react';
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFingerprint,
  IconKey,
  IconLogout,
  IconReceipt2,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
  IconBox,
  IconList,
  IconDashboard,
  IconLayoutKanban
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Navbar.module.css';

const data = [
  { link: '', label: 'Summary', icon: IconDashboard },
  { link: '', label: 'Board', icon: IconLayoutKanban },
  { link: '', label: 'List', icon: IconList },
  { link: '', label: 'Members', icon: IconUser },
//   { link: '', label: 'Databases', icon: IconDatabaseImport },
//   { link: '', label: 'Authentication', icon: Icon2fa },
//   { link: '', label: 'Other Settings', icon: IconSettings },
];

export function Navbar() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          {/* <MantineLogo size={28} /> */}
          {/* <Code fw={700}>v3.1.2</Code> */}
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>Settings</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}