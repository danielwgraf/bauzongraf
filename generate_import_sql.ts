// Helper script to convert INVITE_LIST.ts data to SQL INSERT statements
// Run with: npx tsx generate_import_sql.ts > import_my_invites.sql

interface PartyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface InviteParty {
  id: string;
  lastName: string;
  members: PartyMember[];
}

// Paste your invite list here
const EXPECTED_INVITES: InviteParty[] = [
  {
    id: '1',
    lastName: 'Smith',
    members: [
      { id: '1-1', firstName: 'John', lastName: 'Smith' },
      { id: '1-2', firstName: 'Jane', lastName: 'Smith' },
    ],
  },
  {
    id: '2',
    lastName: 'Johnson',
    members: [
      { id: '2-1', firstName: 'Bob', lastName: 'Johnson' },
    ],
  },
  {
    id: '3',
    lastName: 'Doe',
    members: [
      { id: '3-1', firstName: 'John', lastName: 'Doe' },
      { id: '3-2', firstName: 'Jane', lastName: 'Doe' },
    ],
  },
  {
    id: '4',
    lastName: 'Smith',
    members: [
      { id: '4-1', firstName: 'Jake', lastName: 'Smith' },
      { id: '4-2', firstName: 'Jamie', lastName: 'Smith' },
    ],
  },
];

// Generate SQL
console.log('-- Generated SQL import script');
console.log('-- Run this after creating tables with create_invites_tables.sql\n');

console.log('DO $$');
console.log('DECLARE');
EXPECTED_INVITES.forEach((party, idx) => {
  console.log(`  party${idx + 1}_id UUID;`);
});
console.log('BEGIN\n');

EXPECTED_INVITES.forEach((party, idx) => {
  const varName = `party${idx + 1}_id`;
  console.log(`  -- Party ${idx + 1}: ${party.lastName} (${party.members.map(m => m.firstName).join(' & ')})`);
  console.log(`  INSERT INTO parties (last_name) VALUES ('${party.lastName.replace(/'/g, "''")}') RETURNING id INTO ${varName};`);
  
  const memberValues = party.members.map(m => 
    `    (${varName}, '${m.firstName.replace(/'/g, "''")}', '${m.lastName.replace(/'/g, "''")}')`
  ).join(',\n');
  
  console.log(`  INSERT INTO party_members (party_id, first_name, last_name) VALUES`);
  console.log(memberValues + ';');
  console.log('');
});

console.log('END $$;');

