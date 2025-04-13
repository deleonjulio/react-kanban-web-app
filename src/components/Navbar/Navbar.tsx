import { useState, useEffect } from 'react';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconList,
  IconDashboard,
  IconLayoutKanban
} from '@tabler/icons-react';
import { Group, Title } from '@mantine/core';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const baseRoute = location.pathname.split("/")[1]; 

  const [active, setActive] = useState(baseRoute);

  const navigate = useNavigate()
  const { id } = useParams()

  const { mutate: logoutMutate } = useMutation({
    mutationFn: logout,
    onSettled: () => {
      navigate('/login')
    }
  })

  useEffect(() => {
    if(location) {
      setActive(location.pathname.split("/")[1])
    }
  }, [location])

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.link === active || undefined}
      href={`/${item.link}/${id}`}
      key={item.label}
      onClick={(event) => {
        if(item.link === active) {
          return event.preventDefault();
        }

        event.preventDefault();
        if(item?.link === "list") {
          navigate(`${item?.link}/${id}?page=1`)
        } else {
          navigate(`${item?.link}/${id}`)
        }

        setActive(item.link);
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
          <Title order={6}>Board name</Title>
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