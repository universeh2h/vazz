'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Clock, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { DialogMethodPayment } from '@/components/ui/dialog-payment-method';
import { trpc } from '@/utils/trpc';

export function UserTopUp() {
  const [balance, setBalance] = useState(50000);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { data } = trpc.deposits.getByUsername.useQuery();

  const topUpAmounts = [10000, 15000, 20000, 25000, 50000, 100000];

  const handleTopUpSelection = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleTopUp = () => {
    if (selectedAmount) {
      setBalance(balance + selectedAmount);

      setSelectedAmount(null);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen">
      {/* saldo */}
      <section className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Saldo Anda
            </CardTitle>
            <CardDescription>Saldo tersedia untuk digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{FormatPrice(balance)}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="topup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="topup" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Pilih Nominal Top Up</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topUpAmounts.map((amount) => (
                <DialogMethodPayment key={amount} amount={amount}>
                  <Button
                    variant={selectedAmount === amount ? 'default' : 'outline'}
                    className="h-16"
                    onClick={() => handleTopUpSelection(amount)}
                  >
                    {FormatPrice(amount)}
                  </Button>
                </DialogMethodPayment>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <h3 className="text-lg font-medium mb-4">Riwayat Top Up</h3>
            {data > 0 ? (
              <div className="space-y-3">
                {data.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Top Up</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date.toLocaleString())}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">
                        +{FormatPrice(transaction.amount)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Belum ada riwayat top up
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
