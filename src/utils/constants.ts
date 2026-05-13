import {
  Activity, AlertTriangle, Anchor, Armchair, ArrowDown, ArrowUp, Beer, Bike, BookOpen, Briefcase, Calendar, CalendarCheck, CalendarClock, CalendarDays, CalendarHeart, CalendarMinus, CalendarOff, CalendarPlus, CalendarRange, CalendarSearch, CalendarX, Camera, Car, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CloudOff, Coffee, Database, Dumbbell, Edit, Fish, Flag, Footprints, Gamepad2, Gift, Github, Globe, Headphones, Heart, Home, Hotel, Image as ImageIcon, Key, Layout, List, Loader, Lock, LogIn, LogOut, Map, MapPin, Moon, Mountain, Music, Palette, Palmtree, PartyPopper, Pizza, Plane, Plus, Sailboat, Save, Settings, ShoppingBag, Sofa, Sun, Tag, Tent, Ticket, Train, Truck, Umbrella, User, Users, Utensils, Waves, Wine, X,
} from 'lucide-react';
import type { CategoryColor, IconColorOption, IconMap, KeyItem } from '../types';

export const CATEGORY_COLORS: CategoryColor[] = [
  { id: 'orange', label: 'Orange', bg: 'bg-orange-400', border: 'border-orange-500' },
  { id: 'blue',   label: 'Blue',   bg: 'bg-blue-400',   border: 'border-blue-500'   },
  { id: 'green',  label: 'Green',  bg: 'bg-emerald-400', border: 'border-emerald-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-400', border: 'border-purple-500' },
  { id: 'red',    label: 'Red',    bg: 'bg-rose-400',   border: 'border-rose-500'   },
];

export const ICON_COLOR_OPTIONS: IconColorOption[] = [
  { id: 'gray',   class: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-900 dark:bg-gray-100', label: 'Black/Gray' },
  { id: 'red',    class: 'text-red-600',    bg: 'bg-red-600',    label: 'Red'    },
  { id: 'blue',   class: 'text-blue-600',   bg: 'bg-blue-600',   label: 'Blue'   },
  { id: 'green',  class: 'text-green-600',  bg: 'bg-green-600',  label: 'Green'  },
  { id: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-600', label: 'Yellow' },
  { id: 'purple', class: 'text-purple-600', bg: 'bg-purple-600', label: 'Purple' },
  { id: 'pink',   class: 'text-pink-600',   bg: 'bg-pink-600',   label: 'Pink'   },
  { id: 'orange', class: 'text-orange-600', bg: 'bg-orange-600', label: 'Orange' },
];

export const ICON_MAP: IconMap = {
  Activity, AlertTriangle, Anchor, Armchair, ArrowDown, ArrowUp, Beer, Bike, BookOpen, Briefcase, Calendar, CalendarCheck, CalendarClock, CalendarDays, CalendarHeart, CalendarMinus, CalendarOff, CalendarPlus, CalendarRange, CalendarSearch, CalendarX, Camera, Car, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CloudOff, Coffee, Database, Dumbbell, Edit, Fish, Flag, Footprints, Gamepad: Gamepad2, Gift, Github, Globe, Headphones, Heart, Home, Hotel, ImageIcon, Key, Layout, List, Loader, Lock, LogIn, LogOut, Map, MapPin, Moon, Mountain, Music, None: null, Palette, Palmtree, PartyPopper, Pizza, Plane, Plus, Sailboat, Save, Settings, ShoppingBag, Sofa, Sun, Tag, Tent, Ticket, Train, Truck, Umbrella, User, Users, Utensils, Waves, Wine, X,
};

export const ICON_KEYS: string[] = Object.keys(ICON_MAP);

export const MONTHS: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['clean'],
  ],
};

export const DEFAULT_KEY_ITEMS: KeyItem[] = [];
