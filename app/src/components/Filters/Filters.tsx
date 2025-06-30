import React from 'react';
import { View, StyleSheet } from 'react-native';
import FilterBase from './FilterBase';
import FilterDate from './FilterDate';

interface FilterProps {
    nature: string;
    setNature: (value: string) => void;
    state: string;
    setState: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    account: string;
    setAccount: (value: string) => void;
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
                    onValueChange={setNature}
                    options={[
                        { label: "Despesa", value: "despesa" },
                        { label: "Receita", value: "receita" }
                    ]}
                />

                <FilterBase
                    label="Estado"
                    selectedValue={state}
                    onValueChange={setState}
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