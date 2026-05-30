'use client';

import { useState } from 'react';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function UserStatusControl({ userId, currentStatus = 'active' }: { userId: string; currentStatus?: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState('');

  async function save() {
    setMessage('Saving...');
    try {
      await adminExtendedApi.updateUserStatus(userId, status as any);
      setMessage('Status updated.');
    } catch (error: any) {
      setMessage(error.message || 'Could not update user.');
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="disabled">Disabled</option>
      </Select>
      <Button onClick={save}>Save</Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
