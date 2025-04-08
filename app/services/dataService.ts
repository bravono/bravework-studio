// Base URL for JSONPlaceholder API
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface Order {
  id: string;
  service: string;
  client: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  details: {
    description: string;
    budget: number;
    timeline: string;
    status: string;
    date: string;
    files: Array<{
      name: string;
      size: string;
    }>;
  };
}

// Data Service Functions
export const dataService = {
  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/users`);
    const users = await response.json();
    return users.map((user: any) => ({
      ...user,
      phone: `+1 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: {
        name: user.company.name,
        catchPhrase: user.company.catchPhrase,
        bs: user.company.bs
      }
    }));
  },

  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    const user = await response.json();
    return {
      ...user,
      phone: `+1 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: {
        name: user.company.name,
        catchPhrase: user.company.catchPhrase,
        bs: user.company.bs
      }
    };
  },

  // Posts (for services/portfolio)
  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${BASE_URL}/posts`);
    return response.json();
  },

  async getPostById(id: number): Promise<Post> {
    const response = await fetch(`${BASE_URL}/posts/${id}`);
    return response.json();
  },

  // Comments (for testimonials)
  async getComments(): Promise<Comment[]> {
    const response = await fetch(`${BASE_URL}/comments`);
    return response.json();
  },

  // Generate mock orders from user data
  async getOrders(): Promise<Order[]> {
    const users = await this.getUsers();
    const services = [
      '3D Modeling & Animation',
      'Web Development',
      'UI/UX Design',
      'Kids Training Program',
      'Corporate Training'
    ];
    
    return users.map((user, index) => ({
      id: `ORD${String(index + 1).padStart(3, '0')}`,
      service: services[Math.floor(Math.random() * services.length)],
      client: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company.name
      },
      details: {
        description: `Project for ${user.company.name} - ${user.company.catchPhrase}`,
        budget: Math.floor(Math.random() * 5000) + 1000,
        timeline: `${Math.floor(Math.random() * 12) + 1} weeks`,
        status: ['In Progress', 'Completed', 'On Hold'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        files: [
          { name: 'reference_images.zip', size: '2.5MB' },
          { name: 'requirements.pdf', size: '500KB' }
        ]
      }
    }));
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const orders = await this.getOrders();
    return orders.find(order => order.id === id);
  },

  // Generate mock invoices
  async getInvoices(orderId: string): Promise<any[]> {
    const order = await this.getOrderById(orderId);
    if (!order) return [];

    return [
      {
        id: 'INV001',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-03-15',
        dueDate: '2024-04-15',
        amount: order.details.budget,
        status: 'pending',
        sentAt: '2024-03-15T10:30:00Z'
      },
      {
        id: 'INV002',
        invoiceNumber: 'INV-2024-002',
        issueDate: '2024-03-20',
        dueDate: '2024-04-20',
        amount: order.details.budget * 0.5,
        status: 'paid',
        sentAt: '2024-03-20T14:15:00Z'
      }
    ];
  },

  // Generate mock payments
  async getPayments(invoiceId: string): Promise<any[]> {
    return [
      {
        id: 'PAY001',
        date: '2024-03-20',
        amount: 750,
        method: 'bank_transfer',
        transactionId: 'TRX-2024-001',
        receiptUrl: '/receipts/PAY001.pdf'
      }
    ];
  }
}; 