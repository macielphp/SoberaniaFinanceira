// app\src\components\Filters\Filters.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FilterBase from './FilterBase';
import FilterDate from './FilterDate';
import { Nature, State } from '../../services/FinanceService';

interface FilterProps {
    nature?: Nature;
    setNature: (value: Nature | undefined) => void;
    state?: State;
    setState: (value: State | undefined) => void;
    category?: string;
    setCategory: (value: string | undefined) => void;
    account?: string;
    setAccount: (value: string | undefined) => void;
    categories: string[];
    accounts: string[];
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
}

export const Filters: React.FC<FilterProps> = ({
    nature, setNature,
    state, setState,
    category, setCategory,  
    account, setAccount,
    categories,
    accounts,
    startDate,
    endDate,
    setStartDate,
    setEndDate
}) => {
    return (
        <View style={styles.column}>
            <View style={styles.row}>
                <FilterBase
                    label="Natureza"
                    selectedValue={nature}
                    onValueChange={value => setNature(value as Nature | undefined)}
                    options={[
                        { label: "Despesa", value: "despesa" },
                        { label: "Receita", value: "receita" }
                    ]}
                />

                <FilterBase
                    label="Estado"
                    selectedValue={state}
                    onValueChange={value => setState(value as State | undefined)}
                    options={[
                        { label: "A Pagar", value: "pagar" },
                        { label: "Pago", value: "pago" },
                        { label: "A Receber", value: "receber" },
                        { label: "Recebido", value: "recebido" }
                    ]}
                />
            </View>
            <View style={styles.row}>
                <FilterBase
                    label="Categoria"
                    selectedValue={category}
                    onValueChange={setCategory}
                    options={categories.map(cat => ({ label: cat, value: cat }))}
                />

                <FilterBase
                    label="Conta"
                    selectedValue={account}
                    onValueChange={setAccount}
                    options={accounts.map(acc => ({ label: acc, value: acc }))}
                />
            </View>
            
            <View style={styles.row}>
                <FilterDate
                   startDate={startDate}
                   endDate={endDate}
                   setStartDate={setStartDate}
                   setEndDate={setEndDate}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    column: {
        padding: 0,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    }
})