import { useState } from 'react';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconList,
  IconDashboard,
  IconLayoutKanban
} from '@tabler/icons-react';
import { Group } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { logout } from '../../apis';
import classes from './Navbar.module.css';

const data = [
  { link: 'overview', label: 'Overview', icon: IconDashboard },
  { link: 'board', label: 'Board', icon: IconLayoutKanban },
  { link: 'list', label: 'List', icon: IconList },
  { link: 'members', label: 'Members', icon: IconUser },
];

export function Navbar() {
  const [active, setActive] = useState('Board');
  const navigate = useNavigate()
  const { id } = useParams()

  const { mutate: logoutMutate } = useMutation({
    mutationFn: logout,
    onSettled: () => {
      navigate('/login')
    }
  })

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(`${item?.link}/${id}`)
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

        <a href="#"  
          className={classes.link} 
          onClick={(event) => {
              logoutMutate()
              event.preventDefault()
            }
          }>
          <IconLogout color="red" className={classes.linkIcon} stroke={1.5} />
          <span style={{color: "red"}}>Logout</span>
        </a>
      </div>
    </nav>
  );
}