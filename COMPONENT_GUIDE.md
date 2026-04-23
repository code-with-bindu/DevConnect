# 📚 DevConnect Component Implementation Guide

## Quick Reference for Component Styling

This guide provides copy-paste examples for all major components in DevConnect.

---

## 🎯 Button Components

### Primary Button (Main CTA)
```jsx
<button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 
  text-white rounded-xl shadow-md hover:shadow-lg 
  active:scale-95 transition-all duration-200">
  Create Profile
</button>
```

### Secondary Button (Success/Approve)
```jsx
<button className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 
  text-white rounded-xl shadow-md 
  active:scale-95 transition-all duration-200">
  Approve
</button>
```

### Danger/Reject Button
```jsx
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 
  text-white rounded-xl shadow-md 
  active:scale-95 transition-all duration-200">
  Reject
</button>
```

### Outline Button
```jsx
<button className="px-4 py-2 border-2 border-neutral-300 text-neutral-700
  hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50
  rounded-xl transition-all duration-200">
  Cancel
</button>
```

### Ghost Button (Minimal)
```jsx
<button className="px-4 py-2 text-neutral-700 hover:bg-neutral-100
  rounded-xl transition-all duration-200">
  Skip
</button>
```

### Icon Button (Circular)
```jsx
<button className="p-3 rounded-full hover:bg-neutral-100
  transition-all duration-200">
  <HeartIcon className="w-6 h-6" />
</button>
```

### Button with Icon and Text
```jsx
<button className="flex items-center gap-2 px-4 py-2 bg-primary-500 
  hover:bg-primary-600 text-white rounded-xl shadow-md
  active:scale-95 transition-all duration-200">
  <PlusIcon className="w-5 h-5" />
  Add Connection
</button>
```

---

## 🎨 Card Components

### Base Card (Standard)
```jsx
<div className="card-base hover:shadow-hover transition-shadow duration-200">
  <img className="w-full h-48 object-cover" src={imageUrl} />
  <div className="p-5">
    <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
    <p className="text-neutral-600">{description}</p>
  </div>
</div>
```

### Elevated Card (Featured)
```jsx
<div className="card-elevated hover:shadow-xl transition-shadow duration-200">
  <div className="p-6">
    <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
  </div>
</div>
```

### Profile Card (Large)
```jsx
<div className="card-base overflow-hidden hover:shadow-hover 
  transition-shadow duration-200">
  <div className="relative h-96">
    <img className="w-full h-full object-cover" src={profileImage} />
    <div className="absolute inset-x-0 bottom-0 h-32
      bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
      <h2 className="text-4xl font-bold">{name}</h2>
      <p className="text-neutral-200">{bio}</p>
    </div>
  </div>
</div>
```

### Card with Hover Scale
```jsx
<div className="card-base hover:scale-105 hover:shadow-hover
  transition-all duration-300 cursor-pointer">
  {/* Card content */}
</div>
```

---

## 📝 Input Fields

### Text Input (Base)
```jsx
<input 
  type="text"
  className="input-base w-full px-4 py-3 border-2 border-neutral-200
    rounded-xl focus:border-primary-500 focus:ring-2 
    focus:ring-primary-500/20 transition-all duration-200"
  placeholder="Enter text..."
/>
```

### Textarea
```jsx
<textarea
  className="w-full px-4 py-3 border-2 border-neutral-200
    rounded-xl focus:border-primary-500 focus:ring-2 
    focus:ring-primary-500/20 transition-all duration-200
    resize-none"
  rows="4"
  placeholder="Enter message..."
/>
```

### Select Dropdown
```jsx
<select className="w-full px-4 py-3 border-2 border-neutral-200
  rounded-xl focus:border-primary-500 focus:ring-2 
  focus:ring-primary-500/20 transition-all duration-200">
  <option>Choose option...</option>
  <option>Option 1</option>
</select>
```

### Input with Label
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-neutral-700">
    Email Address
  </label>
  <input 
    type="email"
    className="input-base w-full px-4 py-3 border-2 border-neutral-200
      rounded-xl focus:border-primary-500 focus:ring-2 
      focus:ring-primary-500/20"
  />
</div>
```

---

## 💬 Chat/Message Bubbles

### Sender Message (Right Side)
```jsx
<div className="flex justify-end mb-4">
  <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-br-none
    bg-primary-500 text-white shadow-md animate-slide-up">
    <p className="text-sm">{message.text}</p>
    <p className="text-xs mt-1 opacity-70">{time}</p>
  </div>
</div>
```

### Receiver Message (Left Side)
```jsx
<div className="flex justify-start mb-4">
  <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-bl-none
    bg-neutral-200 text-neutral-900 shadow-sm animate-slide-up">
    <p className="text-sm">{message.text}</p>
    <p className="text-xs mt-1 opacity-60">{time}</p>
  </div>
</div>
```

### Chat Container
```jsx
<div className="flex flex-col h-screen bg-white">
  {/* Header */}
  <div className="border-b border-neutral-200 p-4 flex items-center 
    justify-between sticky top-0 bg-white/95">
    <h2 className="font-bold text-neutral-900">{name}</h2>
    <div className="flex gap-2">
      <button className="p-2 hover:bg-neutral-100 rounded-full">
        <PhoneIcon className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
    {/* Messages here */}
  </div>

  {/* Input */}
  <div className="border-t border-neutral-200 p-4 flex gap-2">
    <input 
      type="text"
      className="flex-1 input-base px-4 py-2.5"
      placeholder="Type message..."
    />
    <button className="p-2.5 bg-primary-500 text-white rounded-xl">
      <SendIcon className="w-5 h-5" />
    </button>
  </div>
</div>
```

---

## 🧭 Navigation & Layout

### NavBar (Fixed Header)
```jsx
<nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md
  border-b border-neutral-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center 
    justify-between">
    {/* Logo */}
    <div className="text-2xl font-bold text-primary-600">
      DevConnect
    </div>

    {/* Nav Links - Desktop */}
    <div className="hidden md:flex gap-8">
      <NavLink href="/feed">Feed</NavLink>
      <NavLink href="/connections">Connections</NavLink>
      <NavLink href="/requests">Requests</NavLink>
    </div>

    {/* Profile & Notifications */}
    <div className="flex items-center gap-4">
      <div className="relative">
        <BellIcon className="w-6 h-6 cursor-pointer hover:text-primary-600" />
        {notifyCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary-500 
            text-white text-xs rounded-full w-5 h-5 flex items-center 
            justify-center animate-pulse">
            {notifyCount}
          </span>
        )}
      </div>
      
      {/* Profile Dropdown */}
      <div className="dropdown">
        <img src={profileImg} className="w-8 h-8 rounded-full 
          cursor-pointer" />
        {/* Dropdown menu */}
      </div>
    </div>
  </div>
</nav>
```

---

## 🔄 Grid Layouts

### Responsive Grid (3 Columns)
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
  gap-4 md:gap-5 lg:gap-6 p-4 md:p-6">
  {items.map(item => (
    <div key={item.id} className="card-base">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Two Column Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

### Centered Container
```jsx
<div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-md">
    {/* Content */}
  </div>
</div>
```

---

## 🚀 Loading & Empty States

### Loading Spinner
```jsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-4 
    border-neutral-200 border-t-primary-500"></div>
</div>
```

### Empty State
```jsx
<div className="flex flex-col items-center justify-center py-16">
  <div className="text-6xl mb-4">😔</div>
  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
    No connections yet
  </h2>
  <p className="text-neutral-600 mb-6">
    Start discovering people to build your network
  </p>
  <button className="btn-primary">Start Browsing</button>
</div>
```

### Skeleton Loading
```jsx
<div className="space-y-4">
  {[1, 2, 3].map(i => (
    <div key={i} className="card-base">
      <div className="h-48 bg-neutral-200 rounded-xl animate-pulse"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  ))}
</div>
```

---

## 📊 Profile Card

### User Profile Display
```jsx
<div className="card-base max-w-md mx-auto overflow-hidden">
  {/* Profile Image */}
  <div className="relative h-64 bg-neutral-200">
    <img className="w-full h-full object-cover" src={avatar} />
  </div>

  {/* Profile Info */}
  <div className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
        <p className="text-neutral-600">{location}</p>
      </div>
      <span className="inline-block px-3 py-1 bg-secondary-100 
        text-secondary-700 rounded-full text-sm font-medium">
        Online
      </span>
    </div>

    <p className="text-neutral-700 mb-6">{bio}</p>

    <div className="flex gap-3">
      <button className="flex-1 btn-primary">Message</button>
      <button className="flex-1 btn-outline">Connect</button>
    </div>
  </div>
</div>
```

---

## 📋 Form Template

### Login Form
```jsx
<div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
  <div className="card-base w-full max-w-md">
    <div className="p-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-neutral-600 mb-8">
        Sign in to your DevConnect account
      </p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email
          </label>
          <input 
            type="email"
            className="input-base w-full px-4 py-3 border-2 
              border-neutral-200 rounded-xl"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Password
          </label>
          <input 
            type="password"
            className="input-base w-full px-4 py-3 border-2 
              border-neutral-200 rounded-xl"
            placeholder="••••••••"
          />
        </div>

        <button className="w-full btn-primary py-3">
          Sign In
        </button>
      </form>

      <p className="text-center text-neutral-600 mt-6">
        Don't have an account? 
        <a href="/signup" className="text-primary-600 hover:text-primary-700 
          font-medium ml-1">
          Sign up
        </a>
      </p>
    </div>
  </div>
</div>
```

---

## 🎬 Animation Examples

### Fade In Animation
```jsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

### Scale Up Animation
```jsx
<div className="animate-scale-up">
  {/* Content */}
</div>
```

### Slide Up Animation
```jsx
<div className="animate-slide-up">
  {/* Content */}
</div>
```

### Combined with Hover
```jsx
<div className="hover:scale-105 hover:shadow-hover 
  transition-all duration-300">
  {/* Content */}
</div>
```

### Staggered Animation
```jsx
<div className="space-y-4">
  {items.map((item, idx) => (
    <div 
      key={item.id}
      className="animate-slide-up"
      style={{
        animationDelay: `${idx * 0.1}s`
      }}
    >
      {/* Item */}
    </div>
  ))}
</div>
```

---

## 🎨 Color Utilities

### Text Colors
```jsx
{/* Primary */}
<p className="text-primary-600">Primary text</p>

{/* Secondary */}
<p className="text-secondary-600">Success text</p>

{/* Neutral */}
<p className="text-neutral-900">Dark text</p>
<p className="text-neutral-600">Medium text</p>
<p className="text-neutral-400">Light text</p>

{/* Danger */}
<p className="text-red-600">Error text</p>
```

### Background Colors
```jsx
{/* Light backgrounds */}
<div className="bg-primary-50 text-primary-900">Light primary</div>
<div className="bg-secondary-50 text-secondary-900">Light success</div>

{/* Dark backgrounds */}
<div className="bg-primary-600 text-white">Dark primary</div>
<div className="bg-neutral-900 text-white">Dark neutral</div>
```

### Border Colors
```jsx
<div className="border-2 border-neutral-200">Default</div>
<div className="border-2 border-primary-500">Primary</div>
<div className="border-2 border-red-500">Danger</div>
```

---

## 📱 Responsive Utilities

### Mobile-First Classes
```jsx
{/* Default: mobile styling */}
<div className="text-base">
  {/* At tablet and up: larger text */}
  <div className="md:text-lg">Text</div>
  {/* At desktop and up: even larger */}
  <div className="lg:text-xl">Text</div>
</div>
```

### Responsive Padding
```jsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Hidden/Visible
```jsx
{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="md:hidden">Mobile only</div>
```

---

## 🔧 Quick Copy-Paste Patterns

### Page Container
```jsx
<div className="min-h-screen bg-neutral-50">
  <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
    {/* Content */}
  </div>
</div>
```

### Centered Card
```jsx
<div className="flex items-center justify-center min-h-screen p-4">
  <div className="card-base w-full max-w-md">
    {/* Content */}
  </div>
</div>
```

### Section with Header
```jsx
<section className="py-8 md:py-12">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    <h2 className="text-3xl font-bold text-neutral-900 mb-8">
      Section Title
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Items */}
    </div>
  </div>
</section>
```

---

## 📖 Tailwind Classes Cheat Sheet

### Spacing
```
p-4    = padding 1rem
m-4    = margin 1rem
gap-4  = gap 1rem
space-y-4 = vertical space between children
```

### Text
```
text-lg       = 18px
font-bold     = 700 weight
text-center   = center align
uppercase     = transform to uppercase
line-clamp-2  = limit to 2 lines
```

### Layout
```
flex           = display flex
items-center   = align items center
justify-center = justify content center
w-full         = width 100%
h-screen       = height 100vh
```

### Responsive
```
md:  = min-width 768px
lg:  = min-width 1024px
xl:  = min-width 1280px
```

### Effects
```
shadow-md        = medium shadow
rounded-xl       = border radius 16px
hover:bg-gray-50 = hover state
transition-all   = smooth transition
active:scale-95  = press effect
```

---

## ✨ Pro Tips

1. **Use predefined classes**: `btn-primary` instead of rebuilding button styles
2. **Group responsive classes**: Build mobile-first, then enhance with md: and lg:
3. **Leverage gap**: Use `gap-4` instead of margin hacks
4. **Space-y/space-x**: Use for consistent spacing between children
5. **Line clamp**: Use `line-clamp-2` to truncate text
6. **Transitions**: Add `transition-all duration-200` to interactive elements
7. **Focus states**: Always include `focus:ring-2` for accessibility
8. **Shadows**: Use `hover:shadow-hover` for interactive feedback

---

**Document Version**: 1.0
**Last Updated**: April 9, 2026
**Tailwind Version**: Latest

